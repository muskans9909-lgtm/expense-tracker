// 1. DOM Elements Selection
const form = document.getElementById('transaction-form');
const editIdInput = document.getElementById('edit-id');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const submitBtn = document.getElementById('submit-btn');
const formHeading = document.getElementById('form-heading');

const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');

const transactionList = document.getElementById('transaction-list');
const filterCategory = document.getElementById('filter-category');

// Form me default aaj ki date set karna
if (dateInput) {
  dateInput.valueAsDate = new Date();
}

// 2. LocalStorage se Data Fetch karna
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// 3. LocalStorage me save karne ka function
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// 4. Totals (Balance, Income, Expense) calculate karne ka function
function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(item => {
    const amt = parseFloat(item.amount);
    if (item.type === 'income') {
      income += amt;
    } else {
      expense += amt;
    }
  });

  const balance = income - expense;

  if (totalBalanceEl) totalBalanceEl.innerText = `₹${balance.toFixed(2)}`;
  if (totalIncomeEl) totalIncomeEl.innerText = `₹${income.toFixed(2)}`;
  if (totalExpenseEl) totalExpenseEl.innerText = `₹${expense.toFixed(2)}`;
}

// 5. Transaction List ko Render karne ka function
function renderTransactions() {
  if (!transactionList) return;

  const selectedCategory = filterCategory ? filterCategory.value : 'all';

  const filteredTransactions = transactions.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  transactionList.innerHTML = '';

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `<li class="empty-state">No transactions found.</li>`;
    return;
  }

  filteredTransactions.forEach(item => {
    const isIncome = item.type === 'income';
    const sign = isIncome ? '+' : '-';
    const borderClass = isIncome ? 'income-border' : 'expense-border';
    const textClass = isIncome ? 'income-text' : 'expense-text';

    const li = document.createElement('li');
    li.className = `transaction-item ${borderClass}`;
    li.innerHTML = `
      <div class="transaction-info">
        <h4>${item.desc}</h4>
        <p>${item.category} • ${item.date}</p>
      </div>
      <div class="transaction-actions">
        <span class="transaction-amount ${textClass}">${sign}₹${parseFloat(item.amount).toFixed(2)}</span>
        <button type="button" class="action-btn edit-btn" onclick="startEdit(${item.id})">Edit</button>
        <button type="button" class="action-btn delete-btn" onclick="deleteTransaction(${item.id})">Delete</button>
      </div>
    `;

    transactionList.appendChild(li);
  });
}

// 6. Add ya Update Transaction Handle karna
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const id = editIdInput.value;
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!desc || isNaN(amount) || amount <= 0 || !date) {
      alert('Please enter valid transaction details.');
      return;
    }

    if (id) {
      // Edit Mode
      transactions = transactions.map(item => {
        if (item.id === parseInt(id)) {
          return { id: parseInt(id), desc, amount, type, category, date };
        }
        return item;
      });

      editIdInput.value = '';
      formHeading.innerText = 'Add New Transaction';
      submitBtn.innerText = 'Add Transaction';
      submitBtn.style.backgroundColor = '#3182ce';
    } else {
      // Add Mode
      const newTransaction = {
        id: Date.now(),
        desc,
        amount,
        type,
        category,
        date
      };
      transactions.unshift(newTransaction);
    }

    saveToLocalStorage();
    updateSummary();
    renderTransactions();

    descInput.value = '';
    amountInput.value = '';
    dateInput.valueAsDate = new Date();
  });
}

// 7. Delete Transaction with Confirmation
window.deleteTransaction = function (id) {
  const confirmDelete = confirm("Are you sure you want to delete this transaction?");
  if (confirmDelete) {
    transactions = transactions.filter(item => item.id !== id);
    saveToLocalStorage();
    updateSummary();
    renderTransactions();
  }
};

// 8. Edit Transaction Mode Start karna
window.startEdit = function (id) {
  const item = transactions.find(t => t.id === id);
  if (!item) return;

  editIdInput.value = item.id;
  descInput.value = item.desc;
  amountInput.value = item.amount;
  typeInput.value = item.type;
  categoryInput.value = item.category;
  dateInput.value = item.date;

  formHeading.innerText = 'Edit Transaction';
  submitBtn.innerText = 'Update Transaction';
  submitBtn.style.backgroundColor = '#2b6cb0';

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 9. Filter Dropdown Event Listener
if (filterCategory) {
  filterCategory.addEventListener('change', renderTransactions);
}

// Initial Load
updateSummary();
renderTransactions();
// Clear All Transactions Functionality
const clearAllBtn = document.getElementById('clear-all-btn');
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', function () {
    if (transactions.length === 0) {
      alert("No transactions to clear!");
      return;
    }

    const confirmClear = confirm("Are you sure you want to delete ALL transactions? This cannot be undone.");
    if (confirmClear) {
      transactions = [];
      saveToLocalStorage();
      updateSummary();
      renderTransactions();
    }
  });
}