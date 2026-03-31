function levenshteinDist(a, b) {
    if (!a || !b) return (a || b).length;
    var m = [];
    for (var i = 0; i <= b.length; ++i) {
        m[i] = [i];
        if (i === 0) continue;
        for (var j = 0; j <= a.length; ++j) {
            m[0][j] = j;
            if (j === 0) continue;
            m[i][j] = b.charAt(i - 1) == a.charAt(j - 1) ? m[i - 1][j - 1] : Math.min(
                m[i-1][j-1] + 1,
                m[i][j-1] + 1,
                m[i-1][j] + 1
            );
        }
    }
    return m[b.length][a.length];
}

let activeTab = 'global';

function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tab-global').style.display = tab === 'global' ? 'block' : 'none';
    document.getElementById('tab-friends').style.display = tab === 'friends' ? 'block' : 'none';

    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', (i === 0 && tab === 'global') || (i === 1 && tab === 'friends'));
    });

    // reset search when switching tabs
    document.getElementById('search-input').value = '';
    applyFilters();
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const sortDir = document.getElementById('sort-select').value;
    const tbodyId = activeTab === 'global' ? 'global-tbody' : 'friends-tbody';
    const emptyId = activeTab === 'global' ? 'global-empty' : 'friends-empty';
    const tbody = document.getElementById(tbodyId);

    if (!tbody) return;

    let rows = Array.from(tbody.querySelectorAll('tr'));

    // filter by username
    rows.forEach(row => {
        const username = row.dataset.username.toLowerCase();
        const dist = levenshteinDist(search, username.substring(0, search.length));
        row.style.display = (username.includes(search) || dist <= 1) ? '' : 'none';
        // row.style.display = (dist <= 1) ? '' : 'none';

    });

    // sort visible rows by score
    const visibleRows = rows.filter(r => r.style.display !== 'none');
    visibleRows.sort((a, b) => {
        const scoreA = parseInt(a.dataset.score);
        const scoreB = parseInt(b.dataset.score);
        return sortDir === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });

    visibleRows.forEach(row => tbody.appendChild(row));

    // update rank numbers
    visibleRows.forEach((row, i) => {
        const rankCell = row.querySelector('.rank-cell');
        if (rankCell) rankCell.textContent = i + 1;
    });

    // show empty message if no results
    const emptyMsg = document.getElementById(emptyId);
    if (emptyMsg) emptyMsg.style.display = visibleRows.length === 0 ? 'block' : 'none';
}
