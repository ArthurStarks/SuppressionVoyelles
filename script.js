document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements - Tool Section
  const inputText = document.getElementById("inputText");
  const outputText = document.getElementById("outputText");
  const resultContainer = document.getElementById("resultContainer");
  const disemvowelBtn = document.getElementById("disemvowelBtn");
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");
  const originalLength = document.getElementById("originalLength");
  const resultLength = document.getElementById("resultLength");
  const vowelsRemoved = document.getElementById("vowelsRemoved");
  const themeToggle = document.querySelector(".theme-toggle");

  // DOM Elements -- Comments Section
  const commentName = document.getElementById("commentName");
  const commentText = document.getElementById("commentText");
  const submitComment = document.getElementById("submitComment");
  const commentsList = document.getElementById("commentsList");
  const commentCount = document.getElementById("commentCount");
  const autoDisemvowel = document.getElementById("autoDisemvowel");

  // Function to remove vowels
  function disemvowel(str) {
    return str.replace(/[aeiou]/gi, "");
  }

  // Event for disemvowel button
  disemvowelBtn.addEventListener("click", function () {
    const input = inputText.value;
    if (input.trim() === "") return;

    const result = disemvowel(input);
    outputText.textContent = result;
    resultContainer.classList.remove("hidden");

    // Update stats
    originalLength.textContent = input.length;
    resultLength.textContent = result.length;
    vowelsRemoved.textContent = input.length - result.length;

    // Enable copy button
    copyBtn.disabled = false;
  });

  // Event for copy button
  copyBtn.addEventListener("click", function () {
    const textToCopy = outputText.textContent;
    navigator.clipboard.writeText(textToCopy).then(function () {
      // Temporarily change button text to indicate success
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copié !";
      copyBtn.style.backgroundColor = "var(--success-color)";

      setTimeout(function () {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = "";
      }, 2000);
    });
  });

  // Event for clear button
  clearBtn.addEventListener("click", function () {
    inputText.value = "";
    outputText.textContent = "";
    resultContainer.classList.add("hidden");
    copyBtn.disabled = true;
  });

  // Dark mode toggle
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    // Change icon
    const icon = themeToggle.querySelector("i");
    if (document.body.classList.contains("dark-mode")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  });

  // Comments functionality
  let comments = [];

  // Load comments from localStorage if available
  if (localStorage.getItem("disemvowelComments")) {
    comments = JSON.parse(localStorage.getItem("disemvowelComments"));
    renderComments();
  }

  // Submit comment
  submitComment.addEventListener("click", function () {
    const name = commentName.value.trim();
    const text = commentText.value.trim();

    if (!name || !text) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const newComment = {
      id: Date.now(),
      name: name,
      text: text,
      originalText: text,
      date: new Date(),
      isDisemvoweled: autoDisemvowel.checked,
    };

    // If auto disemvowel is checked, disemvowel the text
    if (autoDisemvowel.checked) {
      newComment.text = disemvowel(text);
    }

    comments.unshift(newComment);
    saveComments();
    renderComments();

    // Clear form
    commentName.value = "";
    commentText.value = "";
  });

  // Render comments
  function renderComments() {
    if (comments.length === 0) {
      commentsList.innerHTML =
        '<div class="no-comments">Aucun commentaire pour le moment. Soyez le premier à commenter !</div>';
      commentCount.textContent = "(0)";
      return;
    }

    commentsList.innerHTML = "";
    commentCount.textContent = `(${comments.length})`;

    comments.forEach((comment) => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment-item";
      commentEl.dataset.id = comment.id;

      const date = new Date(comment.date);
      const formattedDate = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      commentEl.innerHTML = `
          <div class="comment-header">
            <div class="comment-author">${comment.name}</div>
            <div class="comment-date">${formattedDate}</div>
          </div>
          <div class="comment-content ${
            comment.isDisemvoweled ? "disemvoweled" : ""
          }">${comment.text}</div>
          <div class="comment-actions">
            ${
              !comment.isDisemvoweled
                ? `<button class="disemvowel-btn" data-id="${comment.id}">
                <i class="fas fa-comment-slash"></i> Supprimer les voyelles
              </button>`
                : `<button class="restore-btn" data-id="${comment.id}">
                <i class="fas fa-undo"></i> Restaurer
              </button>`
            }
            <button class="delete-btn" data-id="${comment.id}">
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        `;

      commentsList.appendChild(commentEl);
    });

    // Add event listeners to buttons
    document.querySelectorAll(".disemvowel-btn").forEach((btn) => {
      btn.addEventListener("click", disemvowelComment);
    });

    document.querySelectorAll(".restore-btn").forEach((btn) => {
      btn.addEventListener("click", restoreComment);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", deleteComment);
    });
  }

  // Disemvowel a comment
  function disemvowelComment(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const comment = comments.find((c) => c.id === id);

    if (comment) {
      comment.text = disemvowel(comment.originalText);
      comment.isDisemvoweled = true;
      saveComments();
      renderComments();
    }
  }

  // Restore a comment
  function restoreComment(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const comment = comments.find((c) => c.id === id);

    if (comment) {
      comment.text = comment.originalText;
      comment.isDisemvoweled = false;
      saveComments();
      renderComments();
    }
  }

  // Delete a comment
  function deleteComment(e) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      const id = parseInt(e.currentTarget.dataset.id);
      comments = comments.filter((c) => c.id !== id);
      saveComments();
      renderComments();
    }
  }

  // Save comments to localStorage
  function saveComments() {
    localStorage.setItem("disemvowelComments", JSON.stringify(comments));
  }

  // Animate examples on scroll
  const exampleCards = document.querySelectorAll(".example-card");

  function checkScroll() {
    exampleCards.forEach((card) => {
      const cardPosition = card.getBoundingClientRect();

      // If card is in viewport
      if (cardPosition.top < window.innerHeight && cardPosition.bottom > 0) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }
    });
  }

  // Set initial state for animation
  exampleCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  });

  // Check on scroll and initial load
  window.addEventListener("scroll", checkScroll);
  checkScroll();

  // Add some example comments if none exist
  if (comments.length === 0) {
    const exampleComments = [
      {
        id: Date.now() - 3000,
        name: "Sophie Martin",
        text: "J'adore cet outil ! C'est très amusant de voir comment le texte change sans voyelles.",
        originalText:
          "J'adore cet outil ! C'est très amusant de voir comment le texte change sans voyelles.",
        date: new Date(Date.now() - 3000000),
        isDisemvoweled: false,
      },
      {
        id: Date.now() - 2000,
        text: "C st vrmnt ncryblt ! J n pns ps q c srt s fcl  lre.",
        originalText:
          "C'est vraiment incroyable ! Je ne pensais pas que ce serait si facile à lire.",
        name: "Thomas Dubois",
        date: new Date(Date.now() - 2000000),
        isDisemvoweled: true,
      },
      {
        id: Date.now() - 1000,
        name: "Emma Petit",
        text: "Est-ce que quelqu'un sait si on peut l'utiliser pour d'autres langues ?",
        originalText:
          "Est-ce que quelqu'un sait si on peut l'utiliser pour d'autres langues ?",
        date: new Date(Date.now() - 1000000),
        isDisemvoweled: false,
      },
    ];

    comments = exampleComments;
    saveComments();
    renderComments();
  }
});
