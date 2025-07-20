from django.db import connection
from django.db.models import Q
from .models import Automation
import re


class AutomationSearchService:
    """
    Advanced search service for automations using FTS5 and fuzzy matching.
    """
    
    @staticmethod
    def search(query, limit=50, include_fuzzy=True):
        """
        Perform advanced search across all automation fields.
        
        Args:
            query (str): Search query
            limit (int): Maximum number of results to return
            include_fuzzy (bool): Whether to include fuzzy/spell-corrected results
        
        Returns:
            dict: Search results with exact matches, fuzzy matches, and suggestions
        """
        if not query or not query.strip():
            return {
                'exact_matches': [],
                'fuzzy_matches': [],
                'suggestions': [],
                'total_count': 0
            }
        
        query = query.strip()
        results = {
            'exact_matches': [],
            'fuzzy_matches': [],
            'suggestions': [],
            'total_count': 0
        }
        
        # 1. FTS5 exact search
        fts_results = AutomationSearchService._fts5_search(query, limit)
        results['exact_matches'] = fts_results
        
        # 2. Always run fuzzy search if enabled, to catch typos and variations
        if include_fuzzy:
            fuzzy_results = AutomationSearchService._fuzzy_search(query, limit)
            # Remove duplicates (automations already in exact matches)
            exact_air_ids = {auto['air_id'] for auto in fts_results}
            fuzzy_results = [auto for auto in fuzzy_results if auto['air_id'] not in exact_air_ids]
            results['fuzzy_matches'] = fuzzy_results[:limit - len(fts_results)]  # Limit total results
        
        # 3. Get spell suggestions
        if include_fuzzy:
            results['suggestions'] = AutomationSearchService._get_spell_suggestions(query)
        
        results['total_count'] = len(results['exact_matches']) + len(results['fuzzy_matches'])
        
        return results
    
    @staticmethod
    def _fts5_search(query, limit=50):
        """
        Perform FTS5 search using the virtual table.
        """
        results = []
        
        try:
            with connection.cursor() as cursor:
                # Prepare FTS5 query - escape special characters
                fts_query = AutomationSearchService._prepare_fts_query(query)
                
                # Search using FTS5 with extended snippet fields
                cursor.execute("""
                    SELECT 
                        a.air_id,
                        a.name,
                        a.type,
                        a.brief_description,
                        a.coe_fed,
                        a.complexity,
                        a.tool_version,
                        a.process_details,
                        a.object_details,
                        a.queue,
                        a.shared_folders,
                        a.shared_mailboxes,
                        a.qa_handshake,
                        a.comments,
                        a.documentation,
                        a.path,
                        a.preprod_deploy_date,
                        a.prod_deploy_date,
                        a.warranty_end_date,
                        a.modified,
                        a.created_at,
                        a.updated_at,
                        fts.rank,
                        a.name as name_snippet,
                        a.brief_description as description_snippet,
                        COALESCE(a.name || ' ' || a.brief_description, '') as full_snippet
                    FROM automations_fts fts
                    JOIN automations a ON a.air_id = fts.air_id
                    WHERE automations_fts MATCH ?
                    ORDER BY fts.rank
                    LIMIT ?
                """, [fts_query, limit])
                
                columns = [col[0] for col in cursor.description]
                for row in cursor.fetchall():
                    result = dict(zip(columns, row))
                    results.append(result)
        
        except Exception as e:
            print(f"FTS5 search error: {e}")
            # Fallback to Django ORM search
            results = AutomationSearchService._fallback_search(query, limit)
        
        return results
    
    @staticmethod
    def _fuzzy_search(query, limit=25):
        """
        Perform fuzzy search using pattern matching and partial matches.
        Simple approach with basic typo tolerance.
        """
        results = []
        
        try:
            # Generate simple search variations
            original_words = query.lower().split()
            search_variations = []
            
            # Add original words
            search_variations.extend(original_words)
            
            # Add simple single-character removals for words longer than 3 chars
            for word in original_words:
                if len(word) > 3:
                    # Remove last character (common typo)
                    search_variations.append(word[:-1])
                    # Remove first character 
                    search_variations.append(word[1:])
                    # Remove middle character
                    if len(word) > 4:
                        mid = len(word) // 2
                        search_variations.append(word[:mid] + word[mid+1:])
            
            # Build Q object for all variations
            q_objects = Q()
            
            for term in search_variations:
                if len(term) >= 2:
                    # Create basic fuzzy patterns
                    term_q = (
                        Q(air_id__icontains=term) |
                        Q(name__icontains=term) |
                        Q(type__icontains=term) |
                        Q(brief_description__icontains=term) |
                        Q(coe_fed__icontains=term) |
                        Q(complexity__icontains=term) |
                        Q(comments__icontains=term) |
                        Q(documentation__icontains=term)
                    )
                    q_objects |= term_q
            
            if q_objects:
                queryset = Automation.objects.filter(q_objects).distinct().select_related(
                    'tool', 'modified_by'
                ).prefetch_related(
                    'people_roles__person', 'environments', 'test_data__spoc', 
                    'metrics', 'artifacts'
                )[:limit]
                
                results = []
                for auto in queryset:
                    # Get related data for comprehensive search results
                    people_names = [pr.person.name for pr in auto.people_roles.all()]
                    environments = [f"{env.get_type_display()}: {env.vdi or ''} {env.service_account or ''}".strip() 
                                  for env in auto.environments.all()]
                    
                    result = {
                        'air_id': auto.air_id,
                        'name': auto.name,
                        'type': auto.type,
                        'brief_description': auto.brief_description,
                        'coe_fed': auto.coe_fed,
                        'complexity': auto.complexity,
                        'tool_version': auto.tool_version,
                        'process_details': auto.process_details,
                        'object_details': auto.object_details,
                        'queue': auto.queue,
                        'shared_folders': auto.shared_folders,
                        'shared_mailboxes': auto.shared_mailboxes,
                        'qa_handshake': auto.qa_handshake,
                        'comments': auto.comments,
                        'documentation': auto.documentation,
                        'path': auto.path,
                        'preprod_deploy_date': auto.preprod_deploy_date,
                        'prod_deploy_date': auto.prod_deploy_date,
                        'warranty_end_date': auto.warranty_end_date,
                        'modified': auto.modified,
                        'created_at': auto.created_at,
                        'updated_at': auto.updated_at,
                        'tool_name': auto.tool.name if auto.tool else None,
                        'modified_by_name': auto.modified_by.name if auto.modified_by else None,
                        'people_names': people_names,
                        'environments': environments,
                        'test_data_spoc': auto.test_data.spoc.name if hasattr(auto, 'test_data') and auto.test_data and auto.test_data.spoc else None,
                        'artifacts_link': auto.artifacts.artifacts_link if hasattr(auto, 'artifacts') and auto.artifacts else None,
                        'rank': 0.5,  # Lower rank for fuzzy matches
                    }
                    results.append(result)
                
                return results
        
        except Exception as e:
            print(f"Fuzzy search error: {e}")
        
        return results
    
    @staticmethod
    def _fallback_search(query, limit=50):
        """
        Fallback search using Django ORM when FTS5 is not available.
        """
        queryset = Automation.objects.filter(
            Q(air_id__icontains=query) |
            Q(name__icontains=query) |
            Q(type__icontains=query) |
            Q(brief_description__icontains=query) |
            Q(coe_fed__icontains=query) |
            Q(complexity__icontains=query) |
            Q(tool_version__icontains=query) |
            Q(process_details__icontains=query) |
            Q(object_details__icontains=query) |
            Q(queue__icontains=query) |
            Q(shared_folders__icontains=query) |
            Q(shared_mailboxes__icontains=query) |
            Q(qa_handshake__icontains=query) |
            Q(comments__icontains=query) |
            Q(documentation__icontains=query) |
            Q(path__icontains=query) |
            Q(tool__name__icontains=query) |
            Q(modified_by__name__icontains=query) |
            Q(people_roles__person__name__icontains=query) |
            Q(environments__vdi__icontains=query) |
            Q(environments__service_account__icontains=query) |
            Q(test_data__spoc__name__icontains=query) |
            Q(artifacts__artifacts_link__icontains=query) |
            Q(artifacts__rampup_issue_list__icontains=query)
        ).distinct().select_related('tool', 'modified_by')[:limit]
        
        return [
            {
                'air_id': auto.air_id,
                'name': auto.name,
                'type': auto.type,
                'brief_description': auto.brief_description,
                'coe_fed': auto.coe_fed,
                'complexity': auto.complexity,
                'tool_version': auto.tool_version,
                'process_details': auto.process_details,
                'object_details': auto.object_details,
                'queue': auto.queue,
                'shared_folders': auto.shared_folders,
                'shared_mailboxes': auto.shared_mailboxes,
                'qa_handshake': auto.qa_handshake,
                'comments': auto.comments,
                'documentation': auto.documentation,
                'path': auto.path,
                'preprod_deploy_date': auto.preprod_deploy_date,
                'prod_deploy_date': auto.prod_deploy_date,
                'warranty_end_date': auto.warranty_end_date,
                'modified': auto.modified,
                'created_at': auto.created_at,
                'updated_at': auto.updated_at,
                'tool_name': auto.tool.name if auto.tool else None,
                'modified_by_name': auto.modified_by.name if auto.modified_by else None,
                'rank': 1.0,
            }
            for auto in queryset
        ]
    
    @staticmethod
    def _prepare_fts_query(query):
        """
        Prepare query for FTS5 by escaping special characters and adding operators.
        """
        # Remove or escape FTS5 special characters
        query = re.sub(r'[^\w\s-]', ' ', query)
        
        # Split into words and create phrase queries for better matching
        words = [word.strip() for word in query.split() if len(word.strip()) >= 2]
        
        if not words:
            return '""'
        
        # For single word, use prefix matching
        if len(words) == 1:
            return f'"{words[0]}"*'
        
        # For multiple words, try exact phrase first, then individual words
        phrase_query = f'"{" ".join(words)}"'
        individual_query = " OR ".join(f'"{word}"*' for word in words)
        
        return f'({phrase_query}) OR ({individual_query})'
    
    @staticmethod
    def _get_spell_suggestions(query):
        """
        Get spelling suggestions using spellfix1 if available.
        """
        suggestions = []
        
        try:
            with connection.cursor() as cursor:
                # Check if spellfix1 table exists
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='automation_vocab'
                """)
                
                if not cursor.fetchone():
                    return suggestions  # spellfix1 table doesn't exist
                
                words = query.split()
                for word in words:
                    if len(word) >= 3:  # Only suggest for words 3+ characters
                        cursor.execute("""
                            SELECT word, distance 
                            FROM automation_vocab 
                            WHERE word MATCH ?
                            ORDER BY distance 
                            LIMIT 3
                        """, [word])
                        
                        for suggestion, distance in cursor.fetchall():
                            if distance <= 200 and suggestion.lower() != word.lower():
                                suggestions.append({
                                    'original': word,
                                    'suggestion': suggestion,
                                    'distance': distance
                                })
        
        except Exception as e:
            print(f"Spell suggestion error: {e}")
        
        return suggestions
    
    @staticmethod
    def _generate_typo_variations(word):
        """
        Generate common typo variations for a word.
        """
        if len(word) < 3:
            return []
        
        variations = []
        
        # Single character deletions (missing letter)
        for i in range(len(word)):
            variation = word[:i] + word[i+1:]
            if len(variation) >= 2:
                variations.append(variation)
        
        # Single character insertions (extra letter) - only for short words
        if len(word) <= 6:
            common_chars = 'aeiou'
            for i in range(len(word) + 1):
                for char in common_chars:
                    variation = word[:i] + char + word[i:]
                    variations.append(variation)
        
        # Adjacent character swaps (transposition)
        for i in range(len(word) - 1):
            chars = list(word)
            chars[i], chars[i+1] = chars[i+1], chars[i]
            variations.append(''.join(chars))
        
        # Single character substitutions (wrong letter) - only for common mistakes
        substitutions = {
            'a': 'e', 'e': 'a', 'i': 'e', 'o': 'a', 'u': 'o',
            's': 'z', 'z': 's', 'c': 'k', 'k': 'c', 'f': 'ph'
        }
        
        for i, char in enumerate(word):
            if char in substitutions:
                variation = word[:i] + substitutions[char] + word[i+1:]
                variations.append(variation)
        
        return list(set(variations))  # Remove duplicates
