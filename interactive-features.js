// Quick Actions Handling
document.addEventListener('DOMContentLoaded', () => {
    setupQuickActions();
    setupDynamicCharts();
    setupInteractiveCards();
});

function setupQuickActions() {
    const quickButtons = document.querySelectorAll('.action-btn');
    
    // Define which cards should always be visible
    const alwaysVisibleCards = [
        'quick-actions',
        'summary-card',
        'chart-card',
        'tracking-card'
    ];
    
    // Define form cards that toggle with quick actions
    const formCards = [
        'income-card',
        'expense-card',
        'goals-card',
        'reports-card'
    ];
    
    // Initially show/hide appropriate cards
    document.querySelectorAll('.card').forEach(card => {
        const isFormCard = formCards.some(className => card.classList.contains(className));
        const isAlwaysVisible = alwaysVisibleCards.some(className => card.classList.contains(className));
        
        if (isFormCard && !card.classList.contains('income-card')) {
            card.style.display = 'none';
        } else if (isAlwaysVisible) {
            card.style.display = 'block';
        }
    });
    
    quickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.className.split(' ')[1];
            const cardClass = type.replace('-btn', '-card');
            
            // Remove active class from all buttons
            quickButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Hide all form cards first
            formCards.forEach(className => {
                const cards = document.querySelectorAll('.' + className);
                cards.forEach(card => card.style.display = 'none');
            });
            
            // Show the selected card
            const selectedCards = document.querySelectorAll('.' + cardClass);
            selectedCards.forEach(card => {
                card.style.display = 'block';
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            
            // If it's the reports section, initialize the charts
            if (cardClass === 'reports-card') {
                initializeReportCharts();
            }
        });
    });
}

function setupDynamicCharts() {
    // Update charts periodically for live effect
    setInterval(() => {
        const charts = document.querySelectorAll('canvas');
        charts.forEach(chart => {
            if (chart.chart) {
                chart.chart.update();
            }
        });
    }, 3000);
}

function setupInteractiveCards() {
    // Add hover effect to transaction items
    const transactions = document.querySelectorAll('.transaction-item');
    transactions.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(10px)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });
    
    // Add loading animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    card.style.animation = 'fadeIn 0.5s ease-out forwards';
                }
            });
        });
        
        observer.observe(card);
    });
}

// Add tooltip functionality
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', e => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
        document.querySelector('.tooltip')?.remove();
    });
});

function initializeReportCharts() {
    // Monthly Overview Chart
    const monthlyCtx = document.getElementById('monthlyOverviewChart').getContext('2d');
    new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Income',
                data: [1200, 1900, 1500, 1800, 2000, 2200],
                borderColor: '#10b981',
                tension: 0.3
            }, {
                label: 'Expenses',
                data: [1000, 1500, 1300, 1600, 1800, 1700],
                borderColor: '#ef4444',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses'
                }
            }
        }
    });

    // Category Spending Chart
    const categoryCtx = document.getElementById('categorySpendingChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Transportation', 'Entertainment', 'Housing', 'Utilities'],
            datasets: [{
                data: [300, 200, 150, 800, 250],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#8b5cf6',
                    '#f59e0b',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Spending by Category'
                }
            }
        }
    });

    // Savings Progress Chart
    const savingsCtx = document.getElementById('savingsProgressChart').getContext('2d');
    new Chart(savingsCtx, {
        type: 'bar',
        data: {
            labels: ['Emergency Fund', 'Vacation', 'New Car', 'Home Down Payment'],
            datasets: [{
                label: 'Current Amount',
                data: [5000, 2000, 3000, 10000],
                backgroundColor: '#3b82f6'
            }, {
                label: 'Goal Amount',
                data: [10000, 3000, 15000, 50000],
                backgroundColor: '#e5e7eb'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Savings Goals Progress'
                }
            }
        }
    });

    // Budget Comparison Chart
    const budgetCtx = document.getElementById('budgetComparisonChart').getContext('2d');
    new Chart(budgetCtx, {
        type: 'radar',
        data: {
            labels: ['Food', 'Transportation', 'Entertainment', 'Housing', 'Utilities'],
            datasets: [{
                label: 'Budget',
                data: [500, 300, 200, 1000, 300],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)'
            }, {
                label: 'Actual',
                data: [450, 250, 300, 950, 280],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Budget vs Actual Spending'
                }
            }
        }
    });
}