// Paper Clip Clicker Game Logic
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let gameState = {
        wire: 0,
        paperClips: 0,
        money: 0.00,
        totalClicks: 0,
        totalPaperClips: 0,
        totalWire: 0,
        wireCost: 1.00, // $1.00 for 100 units of wire
        wireDepletionRate: 0.1, // wire units per second
        wireDepletionInterval: null,
        paperClipPrice: 0.50, // $0.50 per paper clip (user can change this)
        demand: 'High' // Demand level based on price
    };

    // DOM elements
    const elements = {
        wireDisplay: document.getElementById('wire-display'),
        paperClipDisplay: document.getElementById('paperclip-display'),
        moneyDisplay: document.getElementById('money-display'),
        produceButton: document.getElementById('produce-button'),
        buyWireButton: document.getElementById('buy-wire-button'),
        sellPaperClipsButton: document.getElementById('sell-paperclips-button'),
        totalClicks: document.getElementById('total-clicks'),
        totalPaperClips: document.getElementById('total-paperclips'),
        totalWire: document.getElementById('total-wire'),
        priceInput: document.getElementById('price-input'),
        setPriceButton: document.getElementById('set-price-button'),
        demandDisplay: document.getElementById('demand-display')
    };

    // Initialize the game
    function initGame() {
        updateDisplays();
        setupEventListeners();
        startWireDepletion();
    }

    // Update all game displays
    function updateDisplays() {
        elements.wireDisplay.textContent = gameState.wire;
        elements.paperClipDisplay.textContent = gameState.paperClips;
        elements.moneyDisplay.textContent = '$' + gameState.money.toFixed(2);
        elements.totalClicks.textContent = gameState.totalClicks;
        elements.totalPaperClips.textContent = gameState.totalPaperClips;
        elements.totalWire.textContent = gameState.totalWire;
        elements.priceInput.value = gameState.paperClipPrice.toFixed(2);
        elements.demandDisplay.textContent = 'Demand: ' + gameState.demand;
    }

    // Set up event listeners
    function setupEventListeners() {
        // Production button click - Make Paper Clip
        elements.produceButton.addEventListener('click', function() {
            if (gameState.wire >= 1) {
                gameState.wire--;
                gameState.paperClips++;
                gameState.totalClicks++;
                gameState.totalPaperClips++;

                // Visual feedback
                showFeedback("Made 1 paper clip!", "success");

                updateDisplays();
            } else {
                showFeedback("You need wire to make paper clips!", "error");
            }
        });

        // Buy wire button click
        elements.buyWireButton.addEventListener('click', function() {
            if (gameState.money >= gameState.wireCost) {
                gameState.money -= gameState.wireCost;
                gameState.wire += 100; // 100 units of wire for $1.00
                gameState.totalWire += 100;

                // Visual feedback
                showFeedback("Bought 100 units of wire for $1.00!", "success");

                updateDisplays();
            } else {
                showFeedback("Not enough money to buy wire! You need $1.00", "error");
            }
        });

        // Sell paper clips button click
        elements.sellPaperClipsButton.addEventListener('click', function() {
            if (gameState.paperClips > 0) {
                const moneyEarned = gameState.paperClips * gameState.paperClipPrice;
                gameState.money += moneyEarned;
                gameState.totalPaperClips += gameState.paperClips;

                // Visual feedback
                showFeedback(`Sold ${gameState.paperClips} paper clips for $${moneyEarned.toFixed(2)}!`, "success");

                gameState.paperClips = 0;
                updateDisplays();
            } else {
                showFeedback("You don't have any paper clips to sell!", "error");
            }
        });

        // Set price button click
        elements.setPriceButton.addEventListener('click', function() {
            const newPrice = parseFloat(elements.priceInput.value);
            if (newPrice >= 0.01) {
                gameState.paperClipPrice = newPrice;
                updateDemandBasedOnPrice();
                updateDisplays();
                showFeedback(`Price set to $${newPrice.toFixed(2)} per paper clip!`, "success");
            } else {
                showFeedback("Price must be at least $0.01!", "error");
            }
        });
    }

    // Update demand based on price
    function updateDemandBasedOnPrice() {
        if (gameState.paperClipPrice < 0.25) {
            gameState.demand = 'Very High';
        } else if (gameState.paperClipPrice < 0.50) {
            gameState.demand = 'High';
        } else if (gameState.paperClipPrice < 0.75) {
            gameState.demand = 'Medium';
        } else if (gameState.paperClipPrice < 1.00) {
            gameState.demand = 'Low';
        } else {
            gameState.demand = 'Very Low';
        }
    }

    // Start wire depletion timer
    function startWireDepletion() {
        gameState.wireDepletionInterval = setInterval(function() {
            if (gameState.wire > 0) {
                gameState.wire = Math.max(0, gameState.wire - gameState.wireDepletionRate);
                updateDisplays();
            }
        }, 1000); // Deplete wire every second
    }

    // Show visual feedback
    function showFeedback(message, type) {
        // Create feedback element
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `feedback ${type}`;
        feedbackElement.textContent = message;

        // Style the feedback element
        feedbackElement.style.position = 'fixed';
        feedbackElement.style.top = '20px';
        feedbackElement.style.right = '20px';
        feedbackElement.style.padding = '10px 20px';
        feedbackElement.style.borderRadius = '5px';
        feedbackElement.style.color = 'white';
        feedbackElement.style.fontWeight = 'bold';
        feedbackElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        feedbackElement.style.zIndex = '1000';
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(-20px)';
        feedbackElement.style.transition = 'all 0.3s ease';

        // Set background color based on type
        if (type === 'success') {
            feedbackElement.style.backgroundColor = '#27ae60';
        } else if (type === 'error') {
            feedbackElement.style.backgroundColor = '#e74c3c';
        }

        // Add to document
        document.body.appendChild(feedbackElement);

        // Trigger animation
        setTimeout(function() {
            feedbackElement.style.opacity = '1';
            feedbackElement.style.transform = 'translateY(0)';
        }, 10);

        // Remove after delay
        setTimeout(function() {
            feedbackElement.style.opacity = '0';
            feedbackElement.style.transform = 'translateY(-20px)';
            setTimeout(function() {
                document.body.removeChild(feedbackElement);
            }, 300);
        }, 2000);
    }

    // Start the game
    initGame();
});