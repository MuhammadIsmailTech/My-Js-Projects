/*   STATE */
    const state = {
      todos: [],
      filter: 'all',
      search: '',
      sort: 'newest',
      theme: 'dark',
      addFormOpen: false,
      searchOpen: false,
      addPriority: 'medium',
      addCategory: 'personal',
      editId: null,
      editPriority: 'medium',
      editCategory: 'personal',
      categoryFilters: new Set(['work', 'personal', 'health', 'shopping', 'learning']),
      draggedId: null
    };

    const CATEGORIES = ['work', 'personal', 'health', 'shopping', 'learning'];
    const PRIORITIES = ['low', 'medium', 'high'];
    const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

    /*  
       DOM REFERENCES
         */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const els = {
      themeToggle: $('#themeToggle'),
      searchToggle: $('#searchToggle'),
      searchBar: $('#searchBar'),
      searchInput: $('#searchInput'),
      searchClose: $('#searchClose'),
      completedCount: $('#completedCount'),
      totalCount: $('#totalCount'),
      statsPercent: $('#statsPercent'),
      progressFill: $('#progressFill'),
      activeCount: $('#activeCount'),
      doneCount: $('#doneCount'),
      overdueBadge: $('#overdueBadge'),
      overdueCount: $('#overdueCount'),
      addTrigger: $('#addTrigger'),
      addForm: $('#addForm'),
      todoInput: $('#todoInput'),
      dueDateInput: $('#dueDateInput'),
      cancelAdd: $('#cancelAdd'),
      confirmAdd: $('#confirmAdd'),
      filterTabs: $('#filterTabs'),
      sortSelect: $('#sortSelect'),
      categoryChips: $('#categoryChips'),
      todoList: $('#todoList'),
      listFooter: $('#listFooter'),
      footerCount: $('#footerCount'),
      clearCompleted: $('#clearCompleted'),
      editModal: $('#editModal'),
      editText: $('#editText'),
      editDate: $('#editDate'),
      editCancel: $('#editCancel'),
      editSave: $('#editSave'),
      toastContainer: $('#toastContainer')
    };

    /*  STORAGE */
    function saveTodos() {
      localStorage.setItem('tasks_todos', JSON.stringify(state.todos));
    }
    function loadTodos() {
      try {
        const saved = localStorage.getItem('tasks_todos');
        if (saved) state.todos = JSON.parse(saved);
      } catch (e) { state.todos = []; }
    }
    function saveTheme() {
      localStorage.setItem('tasks_theme', state.theme);
    }
    function loadTheme() {
      const saved = localStorage.getItem('tasks_theme');
      if (saved) state.theme = saved;
    }

    /*  UTILITIES */
    function generateId() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dTime = date.getTime();
      const tTime = today.getTime();
      const diff = Math.round((dTime - tTime) / (1000 * 60 * 60 * 24));

      if (diff === 0) return 'Today';
      if (diff === 1) return 'Tomorrow';
      if (diff === -1) return 'Yesterday';
      if (diff > 1 && diff <= 7) return 'In ' + diff + 'd';
      if (diff < -1 && diff >= -7) return Math.abs(diff) + 'd ago';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function isOverdue(dateStr) {
      if (!dateStr) return false;
      const date = new Date(dateStr + 'T23:59:59');
      return date < new Date();
    }

    function getCatColor(cat) {
      const map = { work: 'var(--cat-work)', personal: 'var(--cat-personal)', health: 'var(--cat-health)', shopping: 'var(--cat-shopping)', learning: 'var(--cat-learning)' };
      return map[cat] || 'var(--text-muted)';
    }

    function getCatClass(cat) {
      const map = { work: 'c-work', personal: 'c-personal', health: 'c-health', shopping: 'c-shopping', learning: 'c-learning' };
      return map[cat] || '';
    }

    /*  TOAST */
    function showToast(message, type) {
      type = type || 'info';
      const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i>' + message;
      els.toastContainer.appendChild(toast);
      setTimeout(function() {
        toast.classList.add('removing');
        setTimeout(function() { toast.remove(); }, 300);
      }, 2500);
    }

    /*  COMPLETION PARTICLES */
    function spawnParticles(x, y) {
      var colors = ['#E8A832', '#4ADE80', '#FBBF24', '#34D399', '#F0C040'];
      for (var i = 0; i < 8; i++) {
        var p = document.createElement('div');
        p.className = 'completion-particle';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.backgroundColor = colors[i % colors.length];
        var angle = (i / 8) * Math.PI * 2;
        var dist = 18 + Math.random() * 16;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        document.body.appendChild(p);
        setTimeout(function() { p.remove(); }, 600);
      }
    }

    /*  THEME */
    function applyTheme() {
      document.body.setAttribute('data-theme', state.theme);
      var icon = els.themeToggle.querySelector('i');
      icon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    function toggleTheme() {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      saveTheme();
    }

    /*  SEARCH*/
    function toggleSearch(open) {
      state.searchOpen = typeof open === 'boolean' ? open : !state.searchOpen;
      if (state.searchOpen) {
        els.searchBar.classList.add('open');
        setTimeout(function() { els.searchInput.focus(); }, 100);
      } else {
        els.searchBar.classList.remove('open');
        els.searchInput.value = '';
        state.search = '';
        renderTodos();
      }
    }

    /* ADD FORM*/
    function toggleAddForm(open) {
      state.addFormOpen = typeof open === 'boolean' ? open : !state.addFormOpen;
      if (state.addFormOpen) {
        els.addTrigger.style.display = 'none';
        els.addForm.classList.add('open');
        setTimeout(function() { els.todoInput.focus(); }, 150);
      } else {
        els.addTrigger.style.display = '';
        els.addForm.classList.remove('open');
        els.todoInput.value = '';
        els.dueDateInput.value = '';
        state.addPriority = 'medium';
        state.addCategory = 'personal';
        updatePillSelection('#addPriorityPills', state.addPriority, 'p-');
        updatePillSelection('#addCategoryPills', state.addCategory, 'c-');
      }
      els.addTrigger.setAttribute('aria-expanded', state.addFormOpen);
    }

    function updatePillSelection(containerSel, value, prefix) {
      var pills = $$(containerSel + ' .pill-btn');
      pills.forEach(function(pill) {
        var pillVal = pill.getAttribute('data-priority') || pill.getAttribute('data-category');
        if (pillVal === value) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }

    function addTodo() {
      var text = els.todoInput.value.trim();
      if (!text) {
        els.todoInput.style.borderColor = 'var(--danger)';
        setTimeout(function() { els.todoInput.style.borderColor = ''; }, 1200);
        showToast('Please enter a task description', 'error');
        return;
      }
      var todo = {
        id: generateId(),
        text: text,
        completed: false,
        priority: state.addPriority,
        category: state.addCategory,
        dueDate: els.dueDateInput.value || null,
        createdAt: new Date().toISOString()
      };
      state.todos.unshift(todo);
      saveTodos();
      toggleAddForm(false);
      render();
      showToast('Task added successfully', 'success');
    }

    /*  TODO OPERATIONS */
    function toggleTodo(id, event) {
      var todo = state.todos.find(function(t) { return t.id === id; });
      if (!todo) return;
      todo.completed = !todo.completed;
      if (todo.completed && event) {
        var rect = event.currentTarget.getBoundingClientRect();
        spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      saveTodos();
      render();
    }

    function deleteTodo(id) {
      var el = document.querySelector('[data-todo-id="' + id + '"]');
      if (el) {
        el.classList.add('removing');
        setTimeout(function() {
          state.todos = state.todos.filter(function(t) { return t.id !== id; });
          saveTodos();
          render();
          showToast('Task deleted', 'error');
        }, 350);
      } else {
        state.todos = state.todos.filter(function(t) { return t.id !== id; });
        saveTodos();
        render();
      }
    }

    function clearCompleted() {
      var count = state.todos.filter(function(t) { return t.completed; }).length;
      if (count === 0) return;
      state.todos = state.todos.filter(function(t) { return !t.completed; });
      saveTodos();
      render();
      showToast(count + ' completed task' + (count > 1 ? 's' : '') + ' cleared', 'info');
    }

    /*  EDIT MODAL */
    function openEditModal(id) {
      var todo = state.todos.find(function(t) { return t.id === id; });
      if (!todo) return;
      state.editId = id;
      state.editPriority = todo.priority;
      state.editCategory = todo.category;
      els.editText.value = todo.text;
      els.editDate.value = todo.dueDate || '';
      updatePillSelection('#editPriorityPills', state.editPriority, 'p-');
      updatePillSelection('#editCategoryPills', state.editCategory, 'c-');
      els.editModal.classList.add('open');
      setTimeout(function() { els.editText.focus(); }, 200);
    }

    function closeEditModal() {
      els.editModal.classList.remove('open');
      state.editId = null;
    }

    function saveEdit() {
      if (!state.editId) return;
      var text = els.editText.value.trim();
      if (!text) {
        els.editText.style.borderColor = 'var(--danger)';
        setTimeout(function() { els.editText.style.borderColor = ''; }, 1200);
        return;
      }
      var todo = state.todos.find(function(t) { return t.id === state.editId; });
      if (todo) {
        todo.text = text;
        todo.priority = state.editPriority;
        todo.category = state.editCategory;
        todo.dueDate = els.editDate.value || null;
        saveTodos();
        render();
        showToast('Task updated', 'success');
      }
      closeEditModal();
    }

    /*  FILTERING & SORTING*/
    function getVisibleTodos() {
      var filtered = state.todos.slice();

      // Search filter
      if (state.search) {
        var q = state.search.toLowerCase();
        filtered = filtered.filter(function(t) { return t.text.toLowerCase().indexOf(q) !== -1; });
      }

      // Status filter
      if (state.filter === 'active') filtered = filtered.filter(function(t) { return !t.completed; });
      if (state.filter === 'completed') filtered = filtered.filter(function(t) { return t.completed; });

      // Category filter
      if (state.categoryFilters.size < CATEGORIES.length) {
        filtered = filtered.filter(function(t) { return state.categoryFilters.has(t.category); });
      }

      // Sort
      switch (state.sort) {
        case 'newest':
          filtered.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
          break;
        case 'oldest':
          filtered.sort(function(a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
          break;
        case 'priority-high':
          filtered.sort(function(a, b) { return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0); });
          break;
        case 'priority-low':
          filtered.sort(function(a, b) { return (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0); });
          break;
        case 'alpha':
          filtered.sort(function(a, b) { return a.text.localeCompare(b.text); });
          break;
        case 'due-date':
          filtered.sort(function(a, b) {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          });
          break;
      }

      return filtered;
    }

    /*  
       RENDERING
         */
    function renderStats() {
      var total = state.todos.length;
      var completed = state.todos.filter(function(t) { return t.completed; }).length;
      var active = total - completed;
      var overdue = state.todos.filter(function(t) { return !t.completed && isOverdue(t.dueDate); }).length;
      var pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      els.completedCount.textContent = completed;
      els.totalCount.textContent = total;
      els.statsPercent.textContent = pct + '%';
      els.progressFill.style.width = pct + '%';
      els.activeCount.textContent = active;
      els.doneCount.textContent = completed;

      if (overdue > 0) {
        els.overdueBadge.style.display = '';
        els.overdueCount.textContent = overdue;
      } else {
        els.overdueBadge.style.display = 'none';
      }
    }

    function renderTodos() {
      var todos = getVisibleTodos();
      els.todoList.innerHTML = '';

      if (todos.length === 0) {
        var isSearching = state.search.length > 0;
        var isFiltered = state.filter !== 'all' || state.categoryFilters.size < CATEGORIES.length;
        els.todoList.innerHTML =
          '<div class="empty-state">' +
            '<div class="empty-icon"><i class="fas ' + (isSearching ? 'fa-search' : isFiltered ? 'fa-filter' : 'fa-clipboard-list') + '"></i></div>' +
            '<h3>' + (isSearching ? 'No matching tasks' : isFiltered ? 'No tasks match this filter' : 'All clear') + '</h3>' +
            '<p>' + (isSearching ? 'Try a different search term' : isFiltered ? 'Adjust your filters to see more' : 'Add a new task to get started') + '</p>' +
          '</div>';
        els.listFooter.style.display = 'none';
        return;
      }

      todos.forEach(function(todo, i) {
        var item = document.createElement('article');
        item.className = 'todo-item cat-' + todo.category + (todo.completed ? ' completed' : '');
        item.setAttribute('data-todo-id', todo.id);
        item.setAttribute('draggable', 'true');
        item.style.animationDelay = (i * 0.04) + 's';

        var badgesHtml = '';
        // Priority badge
        badgesHtml += '<span class="badge badge-p-' + todo.priority + '">' + todo.priority + '</span>';
        // Category badge
        badgesHtml += '<span class="badge badge-cat" style="color:' + getCatColor(todo.category) + ';background:' + getCatColor(todo.category) + '15">' + todo.category + '</span>';
        // Date badge
        if (todo.dueDate) {
          var overdue = !todo.completed && isOverdue(todo.dueDate);
          badgesHtml += '<span class="badge badge-date' + (overdue ? ' overdue' : '') + '">' +
            '<i class="fas fa-calendar-day" style="font-size:7px;margin-right:3px"></i>' +
            formatDate(todo.dueDate) + (overdue ? ' !' : '') +
          '</span>';
        }

        item.innerHTML =
          '<span class="drag-handle" aria-hidden="true"><i class="fas fa-grip-vertical"></i></span>' +
          '<div class="todo-checkbox" role="checkbox" aria-checked="' + todo.completed + '" aria-label="Toggle task completion" tabindex="0">' +
            '<svg viewBox="0 0 14 14"><polyline points="2.5 7 5.5 10 11.5 4"></polyline></svg>' +
          '</div>' +
          '<div class="todo-content">' +
            '<div class="todo-text">' + escapeHtml(todo.text) + '</div>' +
            '<div class="todo-badges">' + badgesHtml + '</div>' +
          '</div>' +
          '<div class="todo-actions">' +
            '<button class="action-btn edit-btn" aria-label="Edit task" title="Edit"><i class="fas fa-pen"></i></button>' +
            '<button class="action-btn delete-btn" aria-label="Delete task" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
          '</div>';

        els.todoList.appendChild(item);
      });

      // Footer
      var activeTotal = state.todos.filter(function(t) { return !t.completed; }).length;
      var completedTotal = state.todos.filter(function(t) { return t.completed; }).length;
      els.listFooter.style.display = completedTotal > 0 ? 'flex' : 'none';
      els.footerCount.textContent = activeTotal + ' item' + (activeTotal !== 1 ? 's' : '') + ' left';
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function render() {
      renderStats();
      renderTodos();
    }

    /*  
       DRAG & DROP
         */
    function setupDragDrop() {
      els.todoList.addEventListener('dragstart', function(e) {
        var item = e.target.closest('.todo-item');
        if (!item) return;
        state.draggedId = item.getAttribute('data-todo-id');
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        // Required for Firefox
        e.dataTransfer.setData('text/plain', state.draggedId);
      });

      els.todoList.addEventListener('dragend', function(e) {
        var item = e.target.closest('.todo-item');
        if (item) item.classList.remove('dragging');
        state.draggedId = null;
        $$('.todo-item').forEach(function(el) { el.classList.remove('drag-over'); });
      });

      els.todoList.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      els.todoList.addEventListener('dragenter', function(e) {
        var item = e.target.closest('.todo-item');
        if (item && item.getAttribute('data-todo-id') !== state.draggedId) {
          item.classList.add('drag-over');
        }
      });

      els.todoList.addEventListener('dragleave', function(e) {
        var item = e.target.closest('.todo-item');
        if (item) item.classList.remove('drag-over');
      });

      els.todoList.addEventListener('drop', function(e) {
        e.preventDefault();
        $$('.todo-item').forEach(function(el) { el.classList.remove('drag-over'); });
        var targetItem = e.target.closest('.todo-item');
        if (!targetItem || !state.draggedId) return;
        var targetId = targetItem.getAttribute('data-todo-id');
        if (targetId === state.draggedId) return;

        var fromIdx = state.todos.findIndex(function(t) { return t.id === state.draggedId; });
        var toIdx = state.todos.findIndex(function(t) { return t.id === targetId; });
        if (fromIdx === -1 || toIdx === -1) return;

        var removed = state.todos.splice(fromIdx, 1)[0];
        state.todos.splice(toIdx, 0, removed);
        saveTodos();
        render();
        showToast('Task reordered', 'info');
      });
    }

    /*  
       EVENT LISTENERS
         */
    function setupEvents() {
      // Theme
      els.themeToggle.addEventListener('click', toggleTheme);

      // Search
      els.searchToggle.addEventListener('click', function() { toggleSearch(); });
      els.searchClose.addEventListener('click', function() { toggleSearch(false); });
      els.searchInput.addEventListener('input', function() {
        state.search = this.value;
        renderTodos();
      });

      // Add form
      els.addTrigger.addEventListener('click', function() { toggleAddForm(true); });
      els.addTrigger.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAddForm(true); } });
      els.cancelAdd.addEventListener('click', function() { toggleAddForm(false); });
      els.confirmAdd.addEventListener('click', addTodo);
      els.todoInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); addTodo(); } });

      // Add priority pills
      $('#addPriorityPills').addEventListener('click', function(e) {
        var btn = e.target.closest('.pill-btn');
        if (!btn) return;
        state.addPriority = btn.getAttribute('data-priority');
        updatePillSelection('#addPriorityPills', state.addPriority, 'p-');
      });

      // Add category pills
      $('#addCategoryPills').addEventListener('click', function(e) {
        var btn = e.target.closest('.pill-btn');
        if (!btn) return;
        state.addCategory = btn.getAttribute('data-category');
        updatePillSelection('#addCategoryPills', state.addCategory, 'c-');
      });

      // Filter tabs
      els.filterTabs.addEventListener('click', function(e) {
        var tab = e.target.closest('.filter-tab');
        if (!tab) return;
        state.filter = tab.getAttribute('data-filter');
        $$('.filter-tab').forEach(function(t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderTodos();
      });

      // Sort
      els.sortSelect.addEventListener('change', function() {
        state.sort = this.value;
        renderTodos();
      });

      // Category chips
      els.categoryChips.addEventListener('click', function(e) {
        var chip = e.target.closest('.cat-chip');
        if (!chip) return;
        var cat = chip.getAttribute('data-cat');
        if (state.categoryFilters.has(cat)) {
          // Don't allow removing all
          if (state.categoryFilters.size <= 1) {
            showToast('At least one category must be selected', 'error');
            return;
          }
          state.categoryFilters.delete(cat);
          chip.classList.remove('active');
        } else {
          state.categoryFilters.add(cat);
          chip.classList.add('active');
        }
        renderTodos();
      });

      // Todo list interactions (delegation)
      els.todoList.addEventListener('click', function(e) {
        var item = e.target.closest('.todo-item');
        if (!item) return;
        var id = item.getAttribute('data-todo-id');

        // Checkbox
        if (e.target.closest('.todo-checkbox')) {
          toggleTodo(id, e);
          return;
        }
        // Edit
        if (e.target.closest('.edit-btn')) {
          openEditModal(id);
          return;
        }
        // Delete
        if (e.target.closest('.delete-btn')) {
          deleteTodo(id);
          return;
        }
      });

      // Checkbox keyboard
      els.todoList.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var checkbox = e.target.closest('.todo-checkbox');
          if (checkbox) {
            e.preventDefault();
            var item = checkbox.closest('.todo-item');
            if (item) toggleTodo(item.getAttribute('data-todo-id'), e);
          }
        }
      });

      // Clear completed
      els.clearCompleted.addEventListener('click', clearCompleted);

      // Edit modal
      els.editCancel.addEventListener('click', closeEditModal);
      els.editSave.addEventListener('click', saveEdit);
      els.editModal.addEventListener('click', function(e) {
        if (e.target === els.editModal) closeEditModal();
      });
      els.editText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
      });

      // Edit priority pills
      $('#editPriorityPills').addEventListener('click', function(e) {
        var btn = e.target.closest('.pill-btn');
        if (!btn) return;
        state.editPriority = btn.getAttribute('data-priority');
        updatePillSelection('#editPriorityPills', state.editPriority, 'p-');
      });

      // Edit category pills
      $('#editCategoryPills').addEventListener('click', function(e) {
        var btn = e.target.closest('.pill-btn');
        if (!btn) return;
        state.editCategory = btn.getAttribute('data-category');
        updatePillSelection('#editCategoryPills', state.editCategory, 'c-');
      });

      // Global keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        // Escape closes modals/search/form
        if (e.key === 'Escape') {
          if (els.editModal.classList.contains('open')) { closeEditModal(); return; }
          if (state.searchOpen) { toggleSearch(false); return; }
          if (state.addFormOpen) { toggleAddForm(false); return; }
        }
        // / focuses search (only if not typing in an input)
        if (e.key === '/' && !isTyping()) {
          e.preventDefault();
          toggleSearch(true);
        }
        // Ctrl+K focuses search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          toggleSearch(true);
        }
      });

      // Drag and drop
      setupDragDrop();
    }

    function isTyping() {
      var tag = document.activeElement.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable;
    }

    /*  
       INIT
         */
    function init() {
      loadTheme();
      applyTheme();
      loadTodos();

      // Seed sample data if empty
      if (state.todos.length === 0) {
        var today = new Date();
        var fmt = function(d) { return d.toISOString().split('T')[0]; };
        var tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        var yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        var nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 5);

        state.todos = [
          { id: generateId(), text: 'Review Q4 marketing strategy document', completed: false, priority: 'high', category: 'work', dueDate: fmt(tomorrow), createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: generateId(), text: 'Morning yoga session — 30 minutes', completed: true, priority: 'medium', category: 'health', dueDate: fmt(today), createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: generateId(), text: 'Buy groceries: avocados, eggs, sourdough bread', completed: false, priority: 'medium', category: 'shopping', dueDate: fmt(today), createdAt: new Date(Date.now() - 10800000).toISOString() },
          { id: generateId(), text: 'Read chapter 5 of "Designing Data-Intensive Applications"', completed: false, priority: 'low', category: 'learning', dueDate: fmt(nextWeek), createdAt: new Date(Date.now() - 14400000).toISOString() },
          { id: generateId(), text: 'Call dentist to schedule appointment', completed: false, priority: 'high', category: 'personal', dueDate: fmt(yesterday), createdAt: new Date(Date.now() - 18000000).toISOString() },
          { id: generateId(), text: 'Deploy staging environment for new feature branch', completed: true, priority: 'high', category: 'work', dueDate: fmt(yesterday), createdAt: new Date(Date.now() - 21600000).toISOString() },
          { id: generateId(), text: 'Prepare weekly meal plan', completed: false, priority: 'low', category: 'personal', dueDate: null, createdAt: new Date(Date.now() - 25200000).toISOString() }
        ];
        saveTodos();
      }

      render();
      setupEvents();
    }

    // Start the app
    init();