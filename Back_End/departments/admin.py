# departments/admin.py
from django.contrib import admin
from .models import Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Interface d'administration pour les départements"""
    
    # Colonnes affichées dans la liste
    list_display = [
        'id', 
        'name', 
        'code', 
        'get_head_name', 
        'employee_count', 
        'parent_department',
        'created_at'
    ]
    
    # Filtres disponibles
    list_filter = ['created_at', 'parent_department']
    
    # Champs recherchables
    search_fields = ['name', 'code', 'description', 'location', 'email']
    
    # Liens cliquables
    list_display_links = ['id', 'name']
    
    # Champs éditables directement dans la liste
    list_editable = ['code']
    
    # Organisation des champs dans le formulaire
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'code', 'description', 'parent_department')
        }),
        ('Chef et budget', {
            'fields': ('head', 'budget')
        }),
        ('Coordonnées', {
            'fields': ('location', 'phone', 'email')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)  # Section pliable
        }),
    )
    
    # Champs en lecture seule
    readonly_fields = ['created_at', 'updated_at', 'code']
    
    # Aide à la sélection pour les ForeignKey
    raw_id_fields = ['head', 'parent_department']
    
    # Pagination
    list_per_page = 25
    
    # Actions personnalisées
    actions = ['duplicate_department']
    
    def get_head_name(self, obj):
        """Retourne le nom du chef de département"""
        if obj.head:
            return obj.head.user.get_full_name() or obj.head.user.username
        return "-"
    get_head_name.short_description = 'Chef de département'
    get_head_name.admin_order_field = 'head__user__first_name'
    
    def employee_count(self, obj):
        """Retourne le nombre d'employés"""
        return obj.employees.count()
    employee_count.short_description = 'Employés'
    
    def duplicate_department(self, request, queryset):
        """Action pour dupliquer un département"""
        for dept in queryset:
            dept.pk = None  # Crée une nouvelle instance
            dept.name = f"{dept.name} (copie)"
            dept.code = ""  # Sera regénéré automatiquement
            dept.save()
        self.message_user(request, f"{queryset.count()} département(s) dupliqué(s)")
    duplicate_department.short_description = "Dupliquer les départements sélectionnés"
    
    # Personnalisation du template
    class Media:
        css = {
            'all': ('css/admin/departments.css',)
        }