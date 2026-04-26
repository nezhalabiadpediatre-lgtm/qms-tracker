// app.js

// Initialize Supabase
const supabaseUrl = CONFIG.SUPABASE_URL;
const supabaseKey = CONFIG.SUPABASE_ANON_KEY;
const supabaseClient = window.supabaseClient.createClient(supabaseUrl, supabaseKey);

// Global State
let currentUser = null;
let departmentsList = [];
let eventsList = [];

// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const navActions = document.getElementById('nav-actions');
const authForm = document.getElementById('auth-form');
const btnLogout = document.getElementById('btn-logout');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Init
async function initApp() {
    // On simule un utilisateur par défaut pour éviter les erreurs dans le reste du code
    currentUser = { id: '00000000-0000-0000-0000-000000000000', email: 'Qualité (Accès Libre)' };
    
    // On affiche directement l'application
    showApp();
}

    // Auth Listener
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUser = session.user;
            showApp();
        } else {
            currentUser = null;
            showAuth();
        }
    });
}

// Authentication
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Erreur de connexion : " + error.message);
    }
});

btnLogout.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
});

// UI Routing
function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    navActions.classList.add('hidden');
}

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    navActions.classList.remove('hidden');
    document.getElementById('user-display').innerText = currentUser.email;

    loadDepartments();
    loadEvents();
}

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.add('hidden'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.remove('hidden');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

// Modal Logic
const modals = document.querySelectorAll('[id$="-modal"]');
const closeBtns = document.querySelectorAll('.close-modal');

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modals.forEach(m => m.classList.add('hidden'));
    });
});

document.getElementById('btn-add-dept').addEventListener('click', () => {
    document.getElementById('dept-modal').classList.remove('hidden');
});

document.getElementById('btn-add-event').addEventListener('click', () => {
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('event-modal-title').innerText = 'Nouvel Événement';
    document.getElementById('event-modal').classList.remove('hidden');
});

// Departments Logic
document.getElementById('dept-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('dept-name').value;

    const { data, error } = await supabaseClient.from('departments').insert([{ name }]);
    if (error) alert(error.message);
    else {
        document.getElementById('dept-modal').classList.add('hidden');
        document.getElementById('dept-form').reset();
        loadDepartments();
    }
});

async function loadDepartments() {
    const { data, error } = await supabaseClient.from('departments').select('*').order('name');
    if (error) return console.error(error);

    departmentsList = data;

    // Update List UI
    const list = document.getElementById('dept-list');
    list.innerHTML = data.map(d => `<li class="p-3 bg-gray-800/50 rounded border border-gray-700 flex justify-between">
        <span class="font-medium text-neonCyan">${d.name}</span>
    </li>`).join('');

    // Update Select Dropdowns
    const selects = [document.getElementById('ev-dept'), document.getElementById('filter-dept')];
    selects.forEach(sel => {
        const isFilter = sel.id.includes('filter');
        sel.innerHTML = isFilter ? '<option value="">Tous les départements</option>' : '<option value="">Sélectionnez...</option>';
        data.forEach(d => {
            sel.innerHTML += `<option value="${d.id}">${d.name}</option>`;
        });
    });
}

// Events Logic
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        event_type: document.getElementById('ev-type').value,
        department_id: document.getElementById('ev-dept').value,
        event_date: document.getElementById('ev-date').value,
        status: document.getElementById('ev-status').value,
        description: document.getElementById('ev-desc').value,
        root_cause: document.getElementById('ev-root').value,
        action: document.getElementById('ev-action').value,
        action_owner: document.getElementById('ev-owner').value,
        recurrence: document.getElementById('ev-recurrence').checked,
        planned_date: document.getElementById('ev-planned').value,
        completion_date: document.getElementById('ev-completed').value || null,
    };

    const id = document.getElementById('event-id').value;

    let error;
    if (id) {
        const res = await supabaseClient.from('quality_events').update(payload).eq('id', id);
        error = res.error;
    } else {
        payload.created_by = currentUser.id;
        const res = await supabaseClient.from('quality_events').insert([payload]);
        error = res.error;
    }

    if (error) alert("Erreur: " + error.message);
    else {
        document.getElementById('event-modal').classList.add('hidden');
        loadEvents();
    }
});

async function loadEvents() {
    // Basic query
    let query = supabaseClient.from('quality_events').select(`*, departments(name)`);

    // Apply filters
    const typeF = document.getElementById('filter-type').value;
    const deptF = document.getElementById('filter-dept').value;
    const statF = document.getElementById('filter-status').value;

    if (typeF) query = query.eq('event_type', typeF);
    if (deptF) query = query.eq('department_id', deptF);
    if (statF) query = query.eq('status', statF);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return console.error(error);

    eventsList = data;
    renderEvents();
    updateDashboard();
}

function renderEvents() {
    const tbody = document.getElementById('events-table-body');
    tbody.innerHTML = eventsList.map(ev => {
        const deptName = ev.departments ? ev.departments.name : 'Inconnu';
        const statusColor = ev.status === 'Réalisé' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10';

        return `<tr class="hover:bg-gray-800/50 transition-colors">
            <td class="p-4 text-gray-400">${ev.id.substring(0,8)}</td>
            <td class="p-4 font-medium text-white">${ev.event_type}</td>
            <td class="p-4">${deptName}</td>
            <td class="p-4">${ev.event_date}</td>
            <td class="p-4"><span class="px-2 py-1 rounded text-xs ${statusColor} border border-current">${ev.status}</span></td>
            <td class="p-4">
                <button onclick="editEvent('${ev.id}')" class="text-blue-400 hover:text-neonCyan mr-3"><i class="fa-solid fa-pen"></i></button>
            </td>
        </tr>`;
    }).join('');
}

window.editEvent = function(id) {
    const ev = eventsList.find(e => e.id === id);
    if (!ev) return;

    document.getElementById('event-id').value = ev.id;
    document.getElementById('ev-type').value = ev.event_type;
    document.getElementById('ev-dept').value = ev.department_id;
    document.getElementById('ev-date').value = ev.event_date;
    document.getElementById('ev-status').value = ev.status;
    document.getElementById('ev-desc').value = ev.description;
    document.getElementById('ev-root').value = ev.root_cause || '';
    document.getElementById('ev-action').value = ev.action;
    document.getElementById('ev-owner').value = ev.action_owner;
    document.getElementById('ev-recurrence').checked = ev.recurrence;
    document.getElementById('ev-planned').value = ev.planned_date;
    document.getElementById('ev-completed').value = ev.completion_date || '';

    document.getElementById('event-modal-title').innerText = 'Modifier Événement';
    document.getElementById('event-modal').classList.remove('hidden');
};

document.getElementById('btn-filter').addEventListener('click', loadEvents);

function updateDashboard() {
    document.getElementById('stat-total').innerText = eventsList.length;
    document.getElementById('stat-done').innerText = eventsList.filter(e => e.status === 'Réalisé').length;
    document.getElementById('stat-pending').innerText = eventsList.filter(e => e.status === 'En cours').length;
}

// Export to Excel
document.getElementById('btn-export').addEventListener('click', () => {
    if(eventsList.length === 0) return alert("Rien à exporter.");

    const exportData = eventsList.map(ev => ({
        "ID": ev.id,
        "Type": ev.event_type,
        "Département": ev.departments ? ev.departments.name : '',
        "Date Événement": ev.event_date,
        "Description": ev.description,
        "Cause Racine": ev.root_cause,
        "Action": ev.action,
        "Responsable": ev.action_owner,
        "Récurrence": ev.recurrence ? "Oui" : "Non",
        "Date Prévue": ev.planned_date,
        "Date Réalisation": ev.completion_date,
        "Statut": ev.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Événements");

    XLSX.writeFile(workbook, `QMS_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
});

// Run Init
initApp();
