class StickyNotesApp {
  constructor() {
    this.notes = [];
    this.noteId = 1;
    this.draggedNote = null;
    this.dragOffset = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateEmptyState();
  }

  setupEventListeners() {
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.addEventListener("mouseup", () => this.handleMouseUp());
  }

  createNote() {
    const container = document.getElementById("notesContainer");
    const containerRect = container.getBoundingClientRect();

    const note = {
      id: this.noteId++,
      text: "",
      x: Math.random() * (containerRect.width - 200),
      y: Math.random() * (containerRect.height - 200),
      color: "#ffeb3b",
    };

    this.notes.push(note);
    this.renderNote(note);
    this.updateEmptyState();
  }

  renderNote(note) {
    const noteElement = document.createElement("div");
    noteElement.className = "sticky-note";
    noteElement.style.left = note.x + "px";
    noteElement.style.top = note.y + "px";
    noteElement.style.background = note.color;
    noteElement.dataset.noteId = note.id;

    noteElement.innerHTML = `
            <div class="note-header">
                <span>Note #${note.id}</span>
                <button class="delete-btn" onclick="app.deleteNote(${note.id})">×</button>
            </div>
            <textarea class="note-content" placeholder="Write your note here..." onchange="app.updateNoteText(${note.id}, this.value)">${note.text}</textarea>
            <div class="note-colors">
                <div class="color-btn color-yellow" onclick="app.changeNoteColor(${note.id}, '#ffeb3b')"></div>
                <div class="color-btn color-pink" onclick="app.changeNoteColor(${note.id}, '#ff9ff3')"></div>
                <div class="color-btn color-blue" onclick="app.changeNoteColor(${note.id}, '#74b9ff')"></div>
                <div class="color-btn color-green" onclick="app.changeNoteColor(${note.id}, '#00b894')"></div>
                <div class="color-btn color-orange" onclick="app.changeNoteColor(${note.id}, '#fdcb6e')"></div>
                <div class="color-btn color-purple" onclick="app.changeNoteColor(${note.id}, '#a29bfe')"></div>
            </div>
        `;

    noteElement.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e, note.id)
    );

    document.getElementById("notesContainer").appendChild(noteElement);
  }

  handleMouseDown(e, noteId) {
    if (
      e.target.classList.contains("delete-btn") ||
      e.target.classList.contains("note-content") ||
      e.target.classList.contains("color-btn")
    ) {
      return;
    }

    const noteElement = e.currentTarget;
    const rect = noteElement.getBoundingClientRect();

    this.draggedNote = noteId;
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    noteElement.classList.add("dragging");
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.draggedNote) return;

    const noteElement = document.querySelector(
      `[data-note-id="${this.draggedNote}"]`
    );
    const container = document.getElementById("notesContainer");
    const containerRect = container.getBoundingClientRect();

    let newX = e.clientX - containerRect.left - this.dragOffset.x;
    let newY = e.clientY - containerRect.top - this.dragOffset.y;

    // Constrain to container bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - 200));
    newY = Math.max(0, Math.min(newY, containerRect.height - 200));

    noteElement.style.left = newX + "px";
    noteElement.style.top = newY + "px";

    // Update note position in data
    const note = this.notes.find((n) => n.id === this.draggedNote);
    if (note) {
      note.x = newX;
      note.y = newY;
    }
  }

  handleMouseUp() {
    if (this.draggedNote) {
      const noteElement = document.querySelector(
        `[data-note-id="${this.draggedNote}"]`
      );
      noteElement.classList.remove("dragging");
      this.draggedNote = null;
    }
  }

  deleteNote(noteId) {
    this.notes = this.notes.filter((note) => note.id !== noteId);
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);

    noteElement.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      if (noteElement.parentNode) {
        noteElement.parentNode.removeChild(noteElement);
      }
      this.updateEmptyState();
    }, 300);
  }

  updateNoteText(noteId, text) {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      note.text = text;
    }
  }

  changeNoteColor(noteId, color) {
    const note = this.notes.find((n) => n.id === noteId);
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);

    if (note && noteElement) {
      note.color = color;
      noteElement.style.background = color;
    }
  }

  updateEmptyState() {
    const emptyState = document.getElementById("emptyState");
    emptyState.style.display = this.notes.length === 0 ? "flex" : "none";
  }
}

// Initialize the app
const app = new StickyNotesApp();

// Global function for creating notes (called by button)
function createNote() {
  app.createNote();
}

// Add fade out animation
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(style);
