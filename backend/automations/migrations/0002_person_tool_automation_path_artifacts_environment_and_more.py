# Generated by Django 5.0.6 on 2025-07-17 14:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('automations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Tool',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='automation',
            name='path',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='Artifacts',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('artifacts_link', models.URLField(blank=True, null=True)),
                ('code_review', models.CharField(blank=True, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('not_applicable', 'Not Applicable')], max_length=20, null=True)),
                ('demo', models.CharField(blank=True, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('not_applicable', 'Not Applicable')], max_length=20, null=True)),
                ('rampup_issue_list', models.TextField(blank=True, null=True)),
                ('automation', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='artifacts', to='automations.automation')),
            ],
        ),
        migrations.CreateModel(
            name='Environment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('type', models.CharField(choices=[('dev', 'Development'), ('qa', 'QA'), ('uat', 'UAT'), ('prod', 'Production')], max_length=20)),
                ('vdi', models.CharField(blank=True, max_length=200, null=True)),
                ('service_account', models.CharField(blank=True, max_length=200, null=True)),
                ('automation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='environments', to='automations.automation')),
            ],
        ),
        migrations.CreateModel(
            name='Metrics',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('post_prod_total_cases', models.IntegerField(blank=True, null=True)),
                ('post_prod_sys_ex_count', models.IntegerField(blank=True, null=True)),
                ('post_prod_success_rate', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('automation', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to='automations.automation')),
            ],
        ),
        migrations.AddField(
            model_name='automation',
            name='modified_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='modified_automations', to='automations.person'),
        ),
        migrations.CreateModel(
            name='TestData',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('automation', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='test_data', to='automations.automation')),
                ('spoc', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='automations.person')),
            ],
        ),
        migrations.AddField(
            model_name='automation',
            name='tool',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='automations.tool'),
        ),
        migrations.CreateModel(
            name='AutomationPersonRole',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('role', models.CharField(choices=[('project_manager', 'Project Manager'), ('project_designer', 'Project Designer'), ('developer', 'Developer'), ('tester', 'Tester'), ('business_spoc', 'Business SPOC'), ('business_stakeholder', 'Business Stakeholder'), ('app_owner', 'Applications-App Owner')], max_length=50)),
                ('automation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='people_roles', to='automations.automation')),
                ('person', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='automations.person')),
            ],
            options={
                'unique_together': {('automation', 'person', 'role')},
            },
        ),
    ]
