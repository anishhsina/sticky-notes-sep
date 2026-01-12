class StickyNotesApp {
  constructor() {
    this.notes = [];
    this.noteId = 1;
    this.draggedNote = null;
    this.selectedNote = null;
    this.dragOffset = { x: 0, y: 0 };
    this.zIndex = 1;

    this.loadFromStorage();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderAllNotes();
    this.updateEmptyState();
  }

  setupEventListeners() {
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.addEventListener("mouseup", () => this.handleMouseUp());
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));
  }

  /* ---------------- STORAGE ---------------- */

  saveToStorage() {
    localStorage.setItem(
      "stickyNotes",
      JSON.stringify({
        notes: this.notes,
        noteId: this.noteId,
        zIndex: this.zIndex,
      })
    );
  }

  loadFromStorage() {
    const data = JSON.parse(localStorage.getItem("stickyNotes"));
    if (data) {
      this.notes = data.notes || [];
      this.noteId = data.noteId || 1;
      this.zIndex = data.zIndex || 1;
    }
  }

  /* ---------------- NOTES ---------------- */

  createNote() {
    const container = document.getElementById("notesContainer");
    const rect = container.getBoundingClientRect();

    const note = {
      id: this.noteId++,
      text: "",
      x: Math.random() * (rect.width - 220),
      y: Math.random() * (rect.height - 220),
      color: "#ffeb3b",
      z: ++this.zIndex,
    };

    this.notes.push(note);
    this.renderNote(note);
    this.saveToStorage();
    this.updateEmptyState();
  }

  renderAllNotes() {
    this.notes.forEach((note) => this.renderNote(note));
  }

  renderNote(note) {
    const el = document.createElement("div");
    el.className = "sticky-note";
    el.dataset.noteId = note.id;

    Object.assign(el.style, {
      left: note.x + "px",
      top: note.y + "px",
      background: note.color,
      zIndex: note.z,
    });

    el.innerHTML = `
      <div class="note-header">
        <span>Note #${note.id}</span>
        <button class="delete-btn">×</button>
      </div>
      <textarea class="note-content"
        placeholder="Write..."
      >${note.text}</textarea>
      <div class="note-colors">
        ${["#ffeb3b", "#ff9ff3", "#74b9ff", "#00b894", "#fdcb6e", "#a29bfe"]
          .map(
            (c) =>
              `<div class="color-btn" data-color="${c}" style="background:${c}"></div>`
          )
          .join("")}
      </div>
    `;

    el.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e, note.id)
    );
    el.addEventListener("click", () => this.selectNote(note.id));

    el.querySelector(".delete-btn").onclick = () =>
      this.deleteNote(note.id);

    const textarea = el.querySelector(".note-content");
    textarea.addEventListener("input", (e) =>
      this.updateNoteText(note.id, e.target)
    );

    el.querySelectorAll(".color-btn").forEach((btn) => {
      btn.onclick = () =>
        this.changeNoteColor(note.id, btn.dataset.color);
    });

    document.getElementById("notesContainer").appendChild(el);
    this.autoResize(textarea);
  }

  /* ---------------- INTERACTION ---------------- */

  selectNote(noteId) {
    document
      .querySelectorAll(".sticky-note")
      .forEach((n) => n.classList.remove("selected"));

    const el = document.querySelector(`[data-note-id="${noteId}"]`);
    if (el) {
      el.classList.add("selected");
      el.style.zIndex = ++this.zIndex;
      this.selectedNote = noteId;
      this.saveToStorage();
    }
  }

  handleKeyboard(e) {
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      this.createNote();
    }

    if (e.key === "Delete" && this.selectedNote) {
      this.deleteNote(this.selectedNote);
    }
  }

  handleMouseDown(e, noteId) {
    if (e.target.tagName === "TEXTAREA" || e.target.classList.contains("color-btn")) return;

    const rect = e.currentTarget.getBoundingClientRect();
    this.draggedNote = noteId;
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  handleMouseMove(e) {
    if (!this.draggedNote) return;

    const el = document.querySelector(`[data-note-id="${this.draggedNote}"]`);
    const container = document.getElementById("notesContainer");
    const rect = container.getBoundingClientRect();

    let x = e.clientX - rect.left - this.dragOffset.x;
    let y = e.clientY - rect.top - this.dragOffset.y;

    x = Math.max(0, Math.min(x, rect.width - 220));
    y = Math.max(0, Math.min(y, rect.height - 220));

    el.style.left = x + "px";
    el.style.top = y + "px";

    const note = this.notes.find((n) => n.id === this.draggedNote);
    note.x = x;
    note.y = y;
  }

  handleMouseUp() {
    if (this.draggedNote) {
      this.draggedNote = null;
      this.saveToStorage();
    }
  }

  /* ---------------- UPDATES ---------------- */

  updateNoteText(noteId, textarea) {
    const note = this.notes.find((n) => n.id === noteId);
    note.text = textarea.value;
    this.autoResize(textarea);
    this.saveToStorage();
  }

  autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  changeNoteColor(noteId, color) {
    const note = this.notes.find((n) => n.id === noteId);
    const el = document.querySelector(`[data-note-id="${noteId}"]`);
    note.color = color;
    el.style.background = color;
    this.saveToStorage();
  }

  deleteNote(noteId) {
    this.notes = this.notes.filter((n) => n.id !== noteId);
    const el = document.querySelector(`[data-note-id="${noteId}"]`);

    el.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => el.remove(), 300);

    this.selectedNote = null;
    this.saveToStorage();
    this.updateEmptyState();
  }

  updateEmptyState() {
    document.getElementById("emptyState").style.display =
      this.notes.length === 0 ? "flex" : "none";
  }
}

/* -------- INIT -------- */

const app = new StickyNotesApp();
function createNote() {
  app.createNote();
}
