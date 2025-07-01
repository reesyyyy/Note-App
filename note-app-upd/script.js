document.addEventListener('DOMContentLoaded', function() {
    const notesContainer = document.getElementById('notes-container');
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteModal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const modalTitle = document.getElementById('modal-title');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;
    let isEditing = false;

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    function displayNotes(notesToDisplay = notes) {
        notesContainer.innerHTML = '';
        
        if (notesToDisplay.length === 0) {
            notesContainer.innerHTML = '<p class="no-notes">No notes yet. Create your first note!</p>';
            return;
        }
        
        notesToDisplay.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.innerHTML = `
                <h3 class="note-title">${note.title}</h3>
                <p class="note-content">${note.content}</p>
                <p class="note-date">Last edited: ${new Date(note.id).toLocaleString()}</p>
                <div class="note-actions">
                    <button class="edit-btn" data-id="${note.id}">Edit</button>
                    <button class="delete-btn" data-id="${note.id}">Delete</button>
                </div>
            `;
            notesContainer.appendChild(noteElement);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditNote);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteNote);
        });
    }

    function openModal(isEdit = false, note = null) {
        isEditing = isEdit;
        
        if (isEdit && note) {
            modalTitle.textContent = 'Edit Note';
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            currentNoteId = note.id;
        } else {
            modalTitle.textContent = 'New Note';
            noteTitleInput.value = '';
            noteContentInput.value = '';
            currentNoteId = null;
        }
        
        noteModal.style.display = 'flex';
        noteTitleInput.focus();
    }

    function closeModal() {
        noteModal.style.display = 'none';
        isEditing = false;
        currentNoteId = null;
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        if (isEditing && currentNoteId) {
            // Update existing note
            notes = notes.map(note => 
                note.id === currentNoteId ? { ...note, title, content } : note
            );
        } else {
            // Create new note
            const newNote = {
                id: Date.now(),
                title,
                content,
            };
            notes.unshift(newNote);
        }
        
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
        closeModal();
    }

    function handleEditNote(e) {
        const noteId = Number(e.target.getAttribute('data-id'));
        const noteToEdit = notes.find(note => note.id === noteId);
        
        if (noteToEdit) {
            openModal(true, noteToEdit);
        }
    }

    function handleDeleteNote(e) {
        if (confirm('Are you sure you want to delete this note?')) {
            const noteId = Number(e.target.getAttribute('data-id'));
            notes = notes.filter(note => note.id !== noteId);
            localStorage.setItem('notes', JSON.stringify(notes));
            displayNotes();
        }
    }

    function searchNotes() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            displayNotes();
            return;
        }
        
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm)
        );
        
        displayNotes(filteredNotes);
    }

    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = darkModeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    addNoteBtn.addEventListener('click', () => openModal(false));
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    saveNoteBtn.addEventListener('click', saveNote);
    searchBtn.addEventListener('click', searchNotes);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchNotes();
        }
    });
    darkModeToggle.addEventListener('click', toggleTheme);

    window.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeModal();
        }
    });

    displayNotes();
});