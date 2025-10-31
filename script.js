// Initialize data storage
let finances = {
    income: JSON.parse(localStorage.getItem('income')) || [],
    expenses: JSON.parse(localStorage.getItem('expenses')) || [],
    savings: JSON.parse(localStorage.getItem('savings')) || [],
    budgets: JSON.parse(localStorage.getItem('budgets')) || []
};

// DOM elements
const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');
const savingsForm = document.getElementById('savingsForm');
const budgetForm = document.getElementById('budgetForm');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const balanceEl = document.getElementById('balance');
const savingsProgressEl = document.getElementById('savingsProgress');
const transactionListEl = document.getElementById('transactionList');
const budgetTrackingEl = document.getElementById('budgetTracking');

// Charts
let expenseChart;
let incomeExpenseChart;

// Initialize the app
function initApp() {
    updateFinancialSummary();
    renderTransactions();
    renderBudgetTracking();
    createExpenseChart();
    createIncomeExpenseChart();
    
    // Set default dates to today
    document.getElementById('incomeDate').valueAsDate = new Date();
    document.getElementById('expenseDate').valueAsDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('savingsDeadline').valueAsDate = nextMonth;
}

// Add Income
incomeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const source = document.getElementById('incomeSource').value;
    const date = document.getElementById('incomeDate').value;
    
    const newIncome = {
        id: Date.now(),
        amount: amount,
        source: source,
        date: date,
        timestamp: new Date().toISOString()
    };
    
    finances.income.push(newIncome);
    localStorage.setItem('income', JSON.stringify(finances.income));
    
    incomeForm.reset();
    document.getElementById('incomeDate').valueAsDate = new Date();
    
    updateFinancialSummary();
    renderTransactions();
    createIncomeExpenseChart();
    
    alert('Income added successfully!');
});

// Add Expense
expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const date = document.getElementById('expenseDate').value;
    
    const newExpense = {
        id: Date.now(),
        amount: amount,
        category: category,
        description: description,
        date: date,
        timestamp: new Date().toISOString()
    };
    
    finances.expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(finances.expenses));
    
    expenseForm.reset();
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    updateFinancialSummary();
    renderTransactions();
    renderBudgetTracking();
    createExpenseChart();
    createIncomeExpenseChart();
    
    alert('Expense added successfully!');
});

// Set Savings Goal
savingsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const goal = document.getElementById('savingsGoal').value;
    const amount = parseFloat(document.getElementById('savingsAmount').value);
    const deadline = document.getElementById('savingsDeadline').value;
    
    const newSavings = {
        id: Date.now(),
        goal: goal,
        targetAmount: amount,
        deadline: deadline,
        currentAmount: 0
    };
    
    finances.savings.push(newSavings);
    localStorage.setItem('savings', JSON.stringify(finances.savings));
    
    savingsForm.reset();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('savingsDeadline').valueAsDate = nextMonth;
    
    updateFinancialSummary();
    
    alert('Savings goal set successfully!');
});

// Set Monthly Budget
budgetForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const category = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const month = document.getElementById('budgetMonth').value;
    
    // Check if budget for this category and month already exists
    const existingBudgetIndex = finances.budgets.findIndex(
        budget => budget.category === category && budget.month === month
    );
    
    if (existingBudgetIndex !== -1) {
        finances.budgets[existingBudgetIndex].amount = amount;
    } else {
        const newBudget = {
            id: Date.now(),
            category: category,
            amount: amount,
            month: month
        };
        finances.budgets.push(newBudget);
    }
    
    localStorage.setItem('budgets', JSON.stringify(finances.budgets));
    
    budgetForm.reset();
    
    renderBudgetTracking();
    
    alert('Budget set successfully!');
});

// Update financial summary
function updateFinancialSummary() {
    const totalIncome = finances.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = finances.expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    balanceEl.textContent = formatCurrency(balance);
    
    // Update savings progress if any
    if (finances.savings.length > 0) {
        const latestSavings = finances.savings[finances.savings.length - 1];
        latestSavings.currentAmount = Math.min(balance, latestSavings.targetAmount);
        localStorage.setItem('savings', JSON.stringify(finances.savings));
        
        savingsProgressEl.textContent = `${formatCurrency(latestSavings.currentAmount)} / ${formatCurrency(latestSavings.targetAmount)}`;
    } else {
        savingsProgressEl.textContent = `₹0.00 / ₹0.00`;
    }
}

// Render transactions
function renderTransactions() {
    transactionListEl.innerHTML = '';
    
    // Combine income and expenses
    const transactions = [
        ...finances.income.map(item => ({
            ...item,
            type: 'income',
            description: item.source
        })),
        ...finances.expenses.map(item => ({
            ...item,
            type: 'expense'
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Get only the 10 most recent transactions
    const recentTransactions = transactions.slice(0, 10);
    
    if (recentTransactions.length === 0) {
        transactionListEl.innerHTML = '<p>No transactions yet.</p>';
        return;
    }
    
    recentTransactions.forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        
        const formattedDate = new Date(transaction.date).toLocaleDateString();
        
        let categoryTag = '';
        if (transaction.type === 'expense') {
            categoryTag = `<span class="tag tag-${transaction.category}">${capitalizeFirstLetter(transaction.category)}</span>`;
        }
        
        transactionEl.innerHTML = `
            <div class="transaction-info">
                <div>${transaction.description} ${categoryTag}</div>
                <div class="transaction-category">${formattedDate}</div>
            </div>
            <div class="amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        `;
        
        transactionListEl.appendChild(transactionEl);
    });
}

// Render budget tracking
function renderBudgetTracking() {
    budgetTrackingEl.innerHTML = '';
    
    if (finances.budgets.length === 0) {
        budgetTrackingEl.innerHTML = '<p>No budgets set yet.</p>';
        return;
    }
    
    // Get current month in YYYY-MM format
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Filter budgets for current month
    const currentBudgets = finances.budgets.filter(budget => budget.month === currentMonth);
    
    if (currentBudgets.length === 0) {
        budgetTrackingEl.innerHTML = '<p>No budgets set for the current month.</p>';
        return;
    }
    
    currentBudgets.forEach(budget => {
        // Calculate spent amount for this category in current month
        const spent = finances.expenses
            .filter(expense => {
                const expenseMonth = expense.date.substring(0, 7);
                return expense.category === budget.category && expenseMonth === currentMonth;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const percentage = Math.min((spent / budget.amount) * 100, 100);
        const remaining = Math.max(budget.amount - spent, 0);
        
        let progressColor;
        if (percentage < 70) {
            progressColor = 'var(--success)';
        } else if (percentage < 90) {
            progressColor = 'var(--warning)';
        } else {
            progressColor = 'var(--danger)';
        }
        
        const budgetEl = document.createElement('div');
        budgetEl.className = 'summary-item';
        budgetEl.innerHTML = `
            <div>
                <div>${capitalizeFirstLetter(budget.category)}</div>
                <div class="transaction-category">
                    ${formatCurrency(spent)} of ${formatCurrency(budget.amount)} 
                    (${formatCurrency(remaining)} remaining)
                </div>
                <div class="budget-progress">
                    <div class="progress-bar" style="width: ${percentage}%; background-color: ${progressColor}"></div>
                </div>
            </div>
        `;
        
        budgetTrackingEl.appendChild(budgetEl);
    });
}

// Create expense chart
function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Aggregate expenses by category
    const categories = ['food', 'transportation', 'entertainment', 'housing', 'utilities', 'others'];
    const expensesByCategory = categories.map(category => {
        return finances.expenses
            .filter(expense => expense.category === category)
            .reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    // Colors for categories
    const categoryColors = [
        '#10b981', // food
        '#3b82f6', // transportation
        '#8b5cf6', // entertainment
        '#f59e0b', // housing
        '#ef4444', // utilities
        '#6b7280'  // others
    ];
    
    // Destroy previous chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories.map(capitalizeFirstLetter),
            datasets: [{
                data: expensesByCategory,
                backgroundColor: categoryColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Create income vs expense chart
function createIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    // Get the last 6 months
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthLabel = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        months.push({ label: monthLabel, key: monthKey });
    }
    
    // Aggregate income and expenses by month
    const incomeByMonth = months.map(month => {
        return finances.income
            .filter(income => income.date.startsWith(month.key))
            .reduce((sum, income) => sum + income.amount, 0);
    });
    
    const expensesByMonth = months.map(month => {
        return finances.expenses
            .filter(expense => expense.date.startsWith(month.key))
            .reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    // Destroy previous chart if it exists
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }
    
    incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(month => month.label),
            datasets: [
                {
                    label: 'Income',
                    data: incomeByMonth,
                    backgroundColor: 'var(--success)',
                    borderColor: 'var(--success)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expensesByMonth,
                    backgroundColor: 'var(--danger)',
                    borderColor: 'var(--danger)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Helper functions
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize app
document.addEventListener('DOMContentLoaded', initApp);

