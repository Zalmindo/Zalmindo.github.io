const greeting = document.getElementById('greeting');
const greetingSub = document.getElementById('greeting-sub');

const addForm = document.getElementById('add-form');
const gameInput = document.getElementById('game-input');
const platformSelect = document.getElementById('platform-select');
const formMessage = document.getElementById('form-message');

const searchWrap = document.getElementById('search-wrap');
const searchInput = document.getElementById('search-input');
const searchHint = document.getElementById('search-hint');

const gameList = document.getElementById('game-list');
const emptyMessage = document.getElementById('empty-message');
const previewContent = document.getElementById('preview-content');
const preview = document.getElementById('preview');

const menuBtn = document.getElementById('menu-btn');
const filterMenu = document.getElementById('filter-menu');
const filterButtons = document.querySelectorAll('.filter-btn');

const totalCount = document.getElementById('total-count');
const backlogCount = document.getElementById('backlog-count');
const completedCount = document.getElementById('completed-count');

let games = [
    { title: 'Hollow Knight', platform: 'Switch', completed: false },
    { title: 'Elden Ring', platform: 'PlayStation', completed: true },
    { title: 'Stardew Valley', platform: 'PC', completed: false },
    { title: 'Halo Infinite', platform: 'Xbox', completed: false }
];

let currentFilter = 'all';
let searchText = '';

function showGreeting(event) {
    const hour = new Date().getHours();
    let message;
    let subMessage;

    if (hour < 12) {
        message = 'Good morning, Player 1!';
        subMessage = 'Grab a coffee and knock out a quick level before class.';
    } else if (hour < 18) {
        message = 'Good afternoon, Player 1!';
        subMessage = 'Perfect time to chip away at that backlog.';
    } else {
        message = 'Good evening, Player 1!';
        subMessage = 'Night raid time. Which game are we finishing tonight?';
    }

    greeting.textContent = message;
    greetingSub.textContent = subMessage;

    renderGames();

    console.log('Event fired:', event.type);
}

window.addEventListener('load', showGreeting);

function addGame(event) {
    event.preventDefault();

    const title = gameInput.value.trim();

    if (title === '') {
        formMessage.textContent = 'Enter a game title first!';
        formMessage.className = 'form-message error';
        return;
    }

    games.push({
        title: title,
        platform: platformSelect.value,
        completed: false
    });

    formMessage.textContent = `"${title}" added to your backlog!`;
    formMessage.className = 'form-message success';

    gameInput.value = '';
    renderGames();
}

addForm.addEventListener('submit', addGame);

function toggleComplete(event) {
    const index = Number(event.currentTarget.dataset.index);
    games[index].completed = !games[index].completed;
    renderGames();

    showPreview(event);
}

function deleteGame(event) {
    event.stopPropagation();

    const index = Number(event.currentTarget.dataset.index);
    const removed = games.splice(index, 1);

    formMessage.textContent = `"${removed[0].title}" removed.`;
    formMessage.className = 'form-message';

    showPlaceholder();
    renderGames();
}

function searchFocus(event) {
    searchWrap.classList.add('focused');
    searchHint.textContent = 'Searching... start typing a title';
}

function searchBlur(event) {
    searchWrap.classList.remove('focused');
    searchHint.textContent = 'Type to filter your games by title';
}

function searchGames(event) {
    searchText = event.target.value.toLowerCase();
    renderGames();
}

searchInput.addEventListener('focus', searchFocus);
searchInput.addEventListener('blur', searchBlur);
searchInput.addEventListener('input', searchGames);

function showPreview(event) {
    const index = Number(event.currentTarget.dataset.index);
    const game = games[index];

    const status = game.completed ? 'Completed' : 'In Backlog';
    const statusClass = game.completed ? 'tag-done' : 'tag-backlog';

    previewContent.innerHTML = `
        <div class="preview-cover">${game.title.charAt(0).toUpperCase()}</div>
        <h4 class="preview-title">${escapeHTML(game.title)}</h4>
        <p><strong>Platform:</strong> ${game.platform}</p>
        <p><strong>Status:</strong> <span class="tag ${statusClass}">${status}</span></p>
        <p><strong>Slot:</strong> #${index + 1} of ${games.length}</p>
    `;
    preview.classList.add('active');
}

function showPlaceholder() {
    previewContent.innerHTML = '<p class="preview-placeholder">Hover over a game to see its info.</p>';
    preview.classList.remove('active');
}

function hidePreview(event) {
    showPlaceholder();
}

gameList.addEventListener('mouseleave', hidePreview);

function toggleMenu(event) {
    filterMenu.classList.toggle('open');
    menuBtn.classList.toggle('open');

    const isOpen = filterMenu.classList.contains('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
}

function changeFilter(event) {
    currentFilter = event.target.dataset.filter;

    filterButtons.forEach(function (button) {
        button.classList.remove('active');
    });
    event.target.classList.add('active');

    filterMenu.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);

    renderGames();
}

menuBtn.addEventListener('click', toggleMenu);

filterButtons.forEach(function (button) {
    button.addEventListener('click', changeFilter);
});

function createGameCard(game, index) {
    const li = document.createElement('li');
    li.className = 'game-card';
    li.dataset.index = index;
    if (game.completed) {
        li.classList.add('completed');
    }

    li.innerHTML = `
        <span class="check">${game.completed ? '&#10003;' : ''}</span>
        <div class="game-info">
            <span class="game-title">${escapeHTML(game.title)}</span>
            <span class="game-platform">${game.platform}</span>
        </div>
        <button class="delete-btn" data-index="${index}" aria-label="Delete ${escapeHTML(game.title)}">&times;</button>
    `;

    li.addEventListener('click', toggleComplete);
    li.querySelector('.delete-btn').addEventListener('click', deleteGame);

    li.addEventListener('mouseenter', showPreview);

    return li;
}

function renderGames() {
    gameList.innerHTML = '';
    let shown = 0;

    games.forEach(function (game, index) {
        const matchesSearch = game.title.toLowerCase().includes(searchText);
        const matchesFilter =
            currentFilter === 'all' ||
            (currentFilter === 'completed' && game.completed) ||
            (currentFilter === 'backlog' && !game.completed);

        if (matchesSearch && matchesFilter) {
            gameList.appendChild(createGameCard(game, index));
            shown++;
        }
    });

    emptyMessage.style.display = shown === 0 ? 'block' : 'none';
    updateStats();
}

function updateStats() {
    const done = games.filter(function (game) {
        return game.completed;
    }).length;

    totalCount.textContent = games.length;
    completedCount.textContent = done;
    backlogCount.textContent = games.length - done;
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
