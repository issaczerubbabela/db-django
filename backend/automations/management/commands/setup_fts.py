from django.core.management.base import BaseCommand
from django.db import connection
import sqlite3


class Command(BaseCommand):
    help = 'Set up FTS5 virtual table and spellfix1 for enhanced search'

    def handle(self, *args, **options):
        self.stdout.write('Setting up FTS5 and spellfix1...')
        
        with connection.cursor() as cursor:
            # Check SQLite version
            cursor.execute("SELECT sqlite_version()")
            version = cursor.fetchone()[0]
            self.stdout.write(f'SQLite version: {version}')
            
            # Check if FTS5 is available by trying to create a test table
            try:
                cursor.execute("CREATE VIRTUAL TABLE IF NOT EXISTS fts_test USING fts5(content)")
                cursor.execute("DROP TABLE IF EXISTS fts_test")
                self.stdout.write(self.style.SUCCESS('✓ FTS5 is available'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ FTS5 not available: {e}'))
                self.stdout.write('FTS5 requires SQLite 3.20.0 or later with FTS5 compiled in.')
                
                # Fall back to basic setup without FTS5
                self.setup_basic_search()
                return

            # Check for spellfix1 availability
            try:
                # Try to load spellfix1 extension
                cursor.execute("SELECT load_extension('spellfix1')")
                self.stdout.write(self.style.SUCCESS('✓ spellfix1 extension loaded'))
                spellfix_available = True
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠ spellfix1 not available: {e}'))
                self.stdout.write('  Note: spellfix1 is optional and provides spell correction')
                spellfix_available = False

            # Drop existing FTS tables and views
            try:
                cursor.execute("DROP TABLE IF EXISTS automations_fts")
                cursor.execute("DROP VIEW IF EXISTS automations_search_view")
                cursor.execute("DROP TRIGGER IF EXISTS automations_fts_insert")
                cursor.execute("DROP TRIGGER IF EXISTS automations_fts_update")
                cursor.execute("DROP TRIGGER IF EXISTS automations_fts_delete")
                if spellfix_available:
                    cursor.execute("DROP TABLE IF EXISTS automation_vocab")
            except Exception:
                pass  # Tables might not exist

            # Create a view that combines all searchable content
            cursor.execute("""
                CREATE VIEW automations_search_view AS
                SELECT 
                    a.rowid,
                    a.air_id,
                    a.name,
                    a.type,
                    COALESCE(a.brief_description, '') as brief_description,
                    COALESCE(a.coe_fed, '') as coe_fed,
                    COALESCE(a.complexity, '') as complexity,
                    COALESCE(a.tool_version, '') as tool_version,
                    COALESCE(a.process_details, '') as process_details,
                    COALESCE(a.object_details, '') as object_details,
                    COALESCE(a.queue, '') as queue,
                    COALESCE(a.shared_folders, '') as shared_folders,
                    COALESCE(a.shared_mailboxes, '') as shared_mailboxes,
                    COALESCE(a.qa_handshake, '') as qa_handshake,
                    COALESCE(a.comments, '') as comments,
                    COALESCE(a.documentation, '') as documentation,
                    COALESCE(a.path, '') as path,
                    COALESCE(DATE(a.preprod_deploy_date), '') as preprod_deploy_date_text,
                    COALESCE(DATE(a.prod_deploy_date), '') as prod_deploy_date_text,
                    COALESCE(DATE(a.warranty_end_date), '') as warranty_end_date_text,
                    COALESCE(DATE(a.modified), '') as modified_text,
                    COALESCE(GROUP_CONCAT(p.name, ' '), '') as people_names,
                    COALESCE(GROUP_CONCAT(apr.role, ' '), '') as people_roles,
                    COALESCE(t.name, '') as tool_name,
                    COALESCE(mb.name, '') as modified_by_name,
                    COALESCE(GROUP_CONCAT(e.type || ':' || COALESCE(e.vdi, '') || ':' || COALESCE(e.service_account, ''), ' '), '') as environment_details,
                    COALESCE(td_spoc.name, '') as test_data_spoc_name,
                    COALESCE(CAST(m.post_prod_total_cases AS TEXT), '') as metrics_total_cases,
                    COALESCE(CAST(m.post_prod_sys_ex_count AS TEXT), '') as metrics_sys_ex_count,
                    COALESCE(CAST(m.post_prod_success_rate AS TEXT), '') as metrics_success_rate,
                    COALESCE(art.artifacts_link, '') as artifacts_link,
                    COALESCE(art.code_review, '') as artifacts_code_review,
                    COALESCE(art.demo, '') as artifacts_demo,
                    COALESCE(art.rampup_issue_list, '') as artifacts_rampup_issues
                FROM automations a
                LEFT JOIN automations_automationpersonrole apr ON a.air_id = apr.automation_id
                LEFT JOIN automations_person p ON apr.person_id = p.id
                LEFT JOIN automations_tool t ON a.tool_id = t.id
                LEFT JOIN automations_person mb ON a.modified_by_id = mb.id
                LEFT JOIN automations_environment e ON a.air_id = e.automation_id
                LEFT JOIN automations_testdata td ON a.air_id = td.automation_id
                LEFT JOIN automations_person td_spoc ON td.spoc_id = td_spoc.id
                LEFT JOIN automations_metrics m ON a.air_id = m.automation_id
                LEFT JOIN automations_artifacts art ON a.air_id = art.automation_id
                GROUP BY a.air_id
            """)

            # Create FTS5 virtual table with all searchable fields
            cursor.execute("""
                CREATE VIRTUAL TABLE automations_fts USING fts5(
                    air_id,
                    name,
                    type,
                    brief_description,
                    coe_fed,
                    complexity,
                    tool_version,
                    process_details,
                    object_details,
                    queue,
                    shared_folders,
                    shared_mailboxes,
                    qa_handshake,
                    comments,
                    documentation,
                    path,
                    preprod_deploy_date_text,
                    prod_deploy_date_text,
                    warranty_end_date_text,
                    modified_text,
                    people_names,
                    people_roles,
                    tool_name,
                    modified_by_name,
                    environment_details,
                    test_data_spoc_name,
                    metrics_total_cases,
                    metrics_sys_ex_count,
                    metrics_success_rate,
                    artifacts_link,
                    artifacts_code_review,
                    artifacts_demo,
                    artifacts_rampup_issues,
                    content='automations_search_view',
                    content_rowid='rowid'
                )
            """)
            
            # Create triggers to keep FTS5 table updated
            cursor.execute("""
                CREATE TRIGGER automations_fts_insert AFTER INSERT ON automations
                BEGIN
                    INSERT INTO automations_fts(automations_fts) VALUES('rebuild');
                END
            """)
            
            cursor.execute("""
                CREATE TRIGGER automations_fts_update AFTER UPDATE ON automations
                BEGIN
                    INSERT INTO automations_fts(automations_fts) VALUES('rebuild');
                END
            """)
            
            cursor.execute("""
                CREATE TRIGGER automations_fts_delete AFTER DELETE ON automations
                BEGIN
                    INSERT INTO automations_fts(automations_fts) VALUES('rebuild');
                END
            """)
            
            # Initial rebuild of FTS index
            cursor.execute("INSERT INTO automations_fts(automations_fts) VALUES('rebuild')")
            
            # Set up spellfix1 if available
            if spellfix_available:
                try:
                    cursor.execute("""
                        CREATE VIRTUAL TABLE automation_vocab USING spellfix1
                    """)
                    
                    # Populate vocabulary from existing data
                    cursor.execute("""
                        SELECT DISTINCT 
                            TRIM(LOWER(word)) as word
                        FROM (
                            SELECT name as word FROM automations WHERE name IS NOT NULL
                            UNION
                            SELECT type as word FROM automations WHERE type IS NOT NULL
                            UNION
                            SELECT coe_fed as word FROM automations WHERE coe_fed IS NOT NULL
                            UNION
                            SELECT complexity as word FROM automations WHERE complexity IS NOT NULL
                        )
                        WHERE LENGTH(word) > 2
                    """)
                    
                    words = cursor.fetchall()
                    for (word,) in words:
                        try:
                            cursor.execute("INSERT OR IGNORE INTO automation_vocab(word) VALUES (?)", [word])
                        except Exception:
                            pass  # Skip problematic words
                    
                    self.stdout.write(self.style.SUCCESS('✓ spellfix1 vocabulary table created and populated'))
                    
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'⚠ Could not set up spellfix1: {e}'))

        self.stdout.write(self.style.SUCCESS('FTS5 setup completed successfully!'))
        self.stdout.write('You can now use enhanced search with fuzzy matching.')
    
    def setup_basic_search(self):
        """
        Set up basic search functionality without FTS5
        """
        self.stdout.write('Setting up basic search functionality...')
        
        # Create indexes for better search performance
        with connection.cursor() as cursor:
            try:
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_automations_name ON automations(name)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_automations_type ON automations(type)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_automations_air_id ON automations(air_id)")
                self.stdout.write(self.style.SUCCESS('✓ Search indexes created'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠ Could not create indexes: {e}'))
        
        self.stdout.write(self.style.SUCCESS('Basic search setup completed!'))
