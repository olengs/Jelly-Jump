let activeTab = 'global';

function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tab-global').style.display = tab === 'global' ? 'block' : 'none';
    document.getElementById('tab-friends').style.display = tab === 'friends' ? 'block' : 'none';

    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', (i === 0 && tab === 'global') || (i === 1 && tab === 'friends'));
    });
};