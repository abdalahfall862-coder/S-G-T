// Variables globales
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    renderTasks();
    updateStats();
    
    // Charger le thème sauvegardé
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
});

// Ajouter une tâche
function addTask() {
    const input = document.getElementById('taskInput');
    const category = document.getElementById('categorySelect').value;
    const taskText = input.value.trim();

    if (taskText === '') {
        alert('⚠️ Veuillez entrer une tâche !');
        return;
    }

    if (editingTaskId !== null) {
        // Mode édition
        const task = tasks.find(t => t.id === editingTaskId);
        task.text = taskText;
        task.category = category;
        editingTaskId = null;
        document.querySelector('.add-btn').textContent = '➕ Ajouter';
    } else {
        // Nouvelle tâche
        const task = {
            id: Date.now(),
            text: taskText,
            category: category,
            completed: false,
            date: new Date().toLocaleDateString('fr-FR')
        };
        tasks.unshift(task);
    }

    saveTasks();
    input.value = '';
    renderTasks();
    updateStats();
}

// Gérer la touche Entrée
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTask();
    }
}

// Basculer l'état de la tâche
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
}

// Supprimer une tâche
function deleteTask(id) {
    if (confirm('❓ Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Éditer une tâche
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    document.getElementById('taskInput').value = task.text;
    document.getElementById('categorySelect').value = task.category;
    document.querySelector('.add-btn').textContent = '✏️ Modifier';
    editingTaskId = id;
    document.getElementById('taskInput').focus();
}

// Banque de suggestions prédéfinies par catégorie
        const suggestionBank = {
            travail: [
                "Vérifier et répondre aux emails importants",
                "Planifier les tâches de la semaine",
                "Faire le point sur l'avancement des projets",
                "Organiser une réunion d'équipe",
                "Mettre à jour la documentation",
                "Préparer la présentation du projet",
                "Réviser le budget mensuel",
                "Contacter les clients en attente",
                "Optimiser le flux de travail",
                "Nettoyer la boîte de réception"
            ],
            personnel: [
                "Faire une pause de 10 minutes",
                "Boire un verre d'eau",
                "Faire 15 minutes d'exercice",
                "Lire un chapitre d'un livre",
                "Méditer pendant 5 minutes",
                "Organiser l'espace de travail",
                "Préparer les repas de la semaine",
                "Appeler un proche",
                "Faire une promenade",
                "Écouter un podcast inspirant"
            ],
            urgent: [
                "Payer les factures en attente",
                "Rappeler le contact important",
                "Finir le rapport urgent",
                "Envoyer le document demandé",
                "Confirmer le rendez-vous de demain",
                "Réserver le billet de train",
                "Répondre à l'email prioritaire",
                "Soumettre la demande avant la deadline",
                "Vérifier les échéances du jour",
                "Préparer la réunion urgente"
            ],
            autre: [
                "Trier les fichiers du bureau",
                "Sauvegarder les documents importants",
                "Mettre à jour les applications",
                "Nettoyer le cache du navigateur",
                "Vérifier les mises à jour système",
                "Organiser les favoris",
                "Créer une playlist de concentration",
                "Installer un outil de productivité",
                "Configurer les notifications",
                "Personnaliser l'environnement de travail"
            ]
        };

        // Fonction pour obtenir des suggestions IA
        async function getAISuggestions() {
            const suggestionsDiv = document.getElementById('aiSuggestions');
            const aiBtn = document.querySelector('.ai-btn');
            
            // Désactiver le bouton et afficher le loading
            aiBtn.disabled = true;
            suggestionsDiv.innerHTML = '<div class="ai-loading">🤖 L\'IA génère des suggestions personnalisées</div>';
            
            // Simuler un délai pour l'effet IA
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            try {
                // Analyser les tâches existantes
                const existingCategories = tasks.map(t => t.category);
                const taskTexts = tasks.map(t => t.text.toLowerCase());
                
                // Générer 5 suggestions intelligentes
                const suggestions = [];
                const categories = ['travail', 'personnel', 'urgent', 'autre'];
                
                // Prioriser les catégories déjà utilisées
                let priorityCategories = [...new Set(existingCategories)];
                if (priorityCategories.length === 0) {
                    priorityCategories = categories;
                }
                
                // Mélanger et sélectionner des suggestions
                let attemptCount = 0;
                const maxAttempts = 50;
                
                while (suggestions.length < 5 && attemptCount < maxAttempts) {
                    attemptCount++;
                    
                    // Choisir une catégorie (favoriser celles déjà utilisées)
                    const category = Math.random() < 0.7 && priorityCategories.length > 0
                        ? priorityCategories[Math.floor(Math.random() * priorityCategories.length)]
                        : categories[Math.floor(Math.random() * categories.length)];
                    
                    // Choisir une suggestion aléatoire dans cette catégorie
                    const categoryPool = suggestionBank[category];
                    const suggestion = categoryPool[Math.floor(Math.random() * categoryPool.length)];
                    
                    // Vérifier que la suggestion n'existe pas déjà
                    const isDuplicate = taskTexts.some(t => t === suggestion.toLowerCase()) ||
                                      suggestions.some(s => s.text === suggestion);
                    
                    if (!isDuplicate) {
                        suggestions.push({
                            text: suggestion,
                            category: category
                        });
                    }
                }
                
                // Afficher les suggestions
                displaySuggestions(suggestions);
                
            } catch (error) {
                console.error('Erreur:', error);
                
                // En cas d'erreur, afficher des suggestions par défaut
                const defaultSuggestions = [
                    { text: "Faire une pause de 10 minutes", category: "personnel" },
                    { text: "Vérifier mes emails importants", category: "travail" },
                    { text: "Planifier la semaine prochaine", category: "travail" },
                    { text: "Faire 15 minutes d'exercice", category: "personnel" },
                    { text: "Organiser l'espace de travail", category: "autre" }
                ];
                
                displaySuggestions(defaultSuggestions);
            } finally {
                aiBtn.disabled = false;
            }
        }

        // Afficher les suggestions
        function displaySuggestions(suggestions) {
            const suggestionsDiv = document.getElementById('aiSuggestions');
            
            suggestionsDiv.innerHTML = suggestions.map((suggestion, index) => `
                <div class="ai-suggestion-item">
                    <div class="ai-suggestion-content">
                        <div class="ai-suggestion-text">${suggestion.text}</div>
                        <div class="ai-suggestion-category">
                            ${getCategoryIcon(suggestion.category)} ${suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                        </div>
                    </div>
                    <button class="ai-add-btn" onclick="addSuggestedTask('${suggestion.text.replace(/'/g, "\\'")}', '${suggestion.category}')">
                        ➕ Ajouter
                    </button>
                </div>
            `).join('');
        }

        // Ajouter une tâche suggérée
        function addSuggestedTask(text, category) {
            const task = {
                id: Date.now(),
                text: text,
                category: category,
                completed: false,
                date: new Date().toLocaleDateString('fr-FR')
            };
            
            tasks.unshift(task);
            saveTasks();
            renderTasks();
            updateStats();
            
            // Animation de confirmation
            const btn = event.target;
            btn.textContent = '✅ Ajouté';
            btn.style.background = '#059669';
            setTimeout(() => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }, 300);
        }


 // Afficher les suggestions
function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById('aiSuggestions');
    
    suggestionsDiv.innerHTML = suggestions.map((suggestion, index) => `
        <div class="ai-suggestion-item">
            <div class="ai-suggestion-content">
                <div class="ai-suggestion-text">${suggestion.text}</div>
                <div class="ai-suggestion-category">
                    ${getCategoryIcon(suggestion.category)} ${suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                </div>
            </div>
            <button class="ai-add-btn" onclick="addSuggestedTask('${suggestion.text.replace(/'/g, "\\'")}', '${suggestion.category}')">
                ➕ Ajouter
            </button>
        </div>
    `).join('');
    }

// Ajouter une tâche suggérée
 function addSuggestedTask(text, category) {
    const task = {
        id: Date.now(),
        text: text,
        category: category,
        completed: false,
        date: new Date().toLocaleDateString('fr-FR')
    };
    
    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStats();
    
// Animation de confirmation
    const btn = event.target;
    btn.textContent = '✅ Ajouté';
    btn.style.background = '#059669';
    setTimeout(() => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }, 300);
}

// Filtrer les tâches
function filterTasks(filter) {
    currentFilter = filter;
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    renderTasks();
}

// Rechercher des tâches
function searchTasks() {
    renderTasks();
}

// Afficher les tâches
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredTasks = tasks;

    // Filtrer par statut
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    // Filtrer par recherche
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(t => 
            t.text.toLowerCase().includes(searchTerm)
        );
    }

    // Afficher état vide
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>Aucune tâche trouvée</h3>
                <p>${searchTerm ? 'Essayez une autre recherche' : 'Ajoutez votre première tâche !'}</p>
            </div>
        `;
        return;
    }

    // Afficher les tâches
    tasksList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="task-category category-${task.category}">
                        ${getCategoryIcon(task.category)} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                    <span class="task-date">📅 ${task.date}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask(${task.id})">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        </li>
    `).join('');
}

// Obtenir l'icône de catégorie
function getCategoryIcon(category) {
    const icons = {
        travail: '💼',
        personnel: '🏠',
        urgent: '🔥',
        autre: '📌'
    };
    return icons[category] || '📌';
}

// Mettre à jour les statistiques
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('activeTasks').textContent = active;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('completionRate').textContent = rate + '%';
}

// Sauvegarder dans localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Basculer le thème
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const btn = document.querySelector('.theme-toggle');
    btn.textContent = isDark ? '☀️ Mode Clair' : '🌓 Mode Sombre';
}
```

**📁 Structure du projet :**
```
projet-taskmaster/

index.html
style.css
script.js