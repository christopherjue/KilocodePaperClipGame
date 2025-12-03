// Final Paper Clip Clicker Game Logic with Balanced Economy
document.addEventListener('DOMContentLoaded', function() {
    // Game state with updated starting conditions
    let gameState = {
        wire: 100, // Start with 100 units of wire
        paperClips: 0, // Start with 0 paper clips
        money: 100.00, // Start with $100 initial money
        totalClicks: 0,
        totalPaperClips: 0,
        totalWire: 0,
        wireCost: 1.00, // $1.00 for 100 units of wire
        wireDepletionRate: 0.3, // wire units every 2 seconds (0.3 units per 2 seconds)
        wireDepletionInterval: null,
        wireDepletionPaused: false,
        paperClipPrice: 1.00, // Start with $1.00 per paper clip for 150% demand
        demand: 'Medium-High', // Demand level based on price
        demandPercentage: 150, // Start with 150% demand at $1.00
        gameState: 'normal', // normal, warning, critical
        autoclippers: 0, // Number of autoclippers owned
        autoclipperCost: 50.00, // $50.00 per autoclipper
        autoclipperInterval: null, // Interval for autoclipper production
        autoclipperProductionRate: 1, // 1 paper clip per second per autoclipper
        autowires: 0, // Number of autowires owned
        autowireCost: 150.00, // $150.00 per autowire
        autowireInterval: null, // Interval for autowire wire purchasing
        autowireThreshold: 20, // Buy wire when below this threshold
        sellInterval: null, // Interval for automatic selling based on demand
        trustLevel: 1, // Trust level (1 = normal, 2 = doubled demand)
        priceRangeLevel: 1, // Price range level (1 = normal $0-$10, 2 = extended $0-$100)
        clickerUpgradeLevel: 0, // Clicker upgrade level (0 = 1 clip/click, 1 = 2 clips/click, etc.)
        sellSpeedMultiplier: 1, // Sell speed multiplier (1 = normal, 2 = double speed)
        wiresBought: 0, // Count of wires bought for price increase
        autoclickersBought: 0, // Count of autoclickers bought for price increase
        priceLock: false, // Whether prices are locked
        autoclipperBaseCost: 50.00, // Base cost for autoclipper price lock
        autowireBaseCost: 150.00 // Base cost for autowire price lock
    };

    // DOM elements
    const elements = {
        wireDisplay: document.getElementById('wire-display'),
        paperClipDisplay: document.getElementById('paperclip-display'),
        moneyDisplay: document.getElementById('money-display'),
        produceButton: document.getElementById('produce-button'),
        buyWireButton: document.getElementById('buy-wire-button'),
        sellPaperClipsButton: document.getElementById('sell-paperclips-button'),
        priceInput: document.getElementById('price-input'),
        setPriceButton: document.getElementById('set-price-button'),
        demandDisplay: document.getElementById('demand-display'),
        demandValue: document.getElementById('demand-value'),
        demandLevel: document.getElementById('demand-level'),
        totalClicks: document.getElementById('total-clicks'),
        totalPaperClips: document.getElementById('total-paperclips'),
        totalWire: document.getElementById('total-wire'),
        depletionStatus: document.getElementById('depletion-status'),
        gameStateIndicator: document.getElementById('game-state'),
        wireCard: document.getElementById('wire-card'),
        paperclipCard: document.getElementById('paperclip-card'),
        moneyCard: document.getElementById('money-card'),
        wireProgress: document.getElementById('wire-progress'),
        paperclipProgress: document.getElementById('paperclip-progress'),
        moneyProgress: document.getElementById('money-progress'),
        clickArea: document.getElementById('produce-button'),
        autoclipperCount: document.getElementById('autoclipper-count'),
        autoclipperProduction: document.getElementById('autoclipper-production'),
        buyAutoclipperButton: document.getElementById('buy-autoclipper-button'),
        autowireCount: document.getElementById('autowire-count'),
        autowireStatus: document.getElementById('autowire-status'),
        buyAutowireButton: document.getElementById('buy-autowire-button'),
        trustUpgradeButton: document.getElementById('trust-upgrade-button'),
        trustLevelDisplay: document.getElementById('trust-level'),
        priceLockButton: document.getElementById('price-lock-button'),
        priceLockStatus: document.getElementById('price-lock-status'),
        priceRangeButton: document.getElementById('price-range-button'),
        priceRangeDisplay: document.getElementById('price-range-level'),
        clickerUpgradeButton: document.getElementById('clicker-upgrade-button'),
        clickerLevelDisplay: document.getElementById('clicker-level'),
        sellSpeedButton: document.getElementById('sell-speed-button'),
        sellSpeedDisplay: document.getElementById('sell-speed-multiplier')
    };

    // Initialize the game
    function initGame() {
        // Initialize price input field with the starting price from game state
        elements.priceInput.value = gameState.paperClipPrice.toFixed(2);
        updateDisplays();
        setupEventListeners();
        startWireDepletion();
        updateGameState();
    }

    // Update all game displays
    function updateDisplays() {
        elements.wireDisplay.textContent = Math.floor(gameState.wire);
        elements.paperClipDisplay.textContent = gameState.paperClips;
        elements.moneyDisplay.textContent = '$' + gameState.money.toFixed(2);

        // NEVER update price input from game state - always preserve user customization
        // This completely fixes the price locking issue
        // const currentPriceValue = parseFloat(elements.priceInput.value);
        // if (!isNaN(currentPriceValue) && Math.abs(currentPriceValue - gameState.paperClipPrice) > 0.001) {
        //     elements.priceInput.value = gameState.paperClipPrice.toFixed(2);
        // }

        elements.demandValue.textContent = gameState.demand;
        elements.demandLevel.textContent = `${gameState.demand} (${gameState.demandPercentage}%)`;
        elements.totalClicks.textContent = gameState.totalClicks;
        elements.totalPaperClips.textContent = gameState.totalPaperClips;
        elements.totalWire.textContent = gameState.totalWire;
        elements.depletionStatus.textContent = gameState.wireDepletionPaused ? 'Paused' : 'Active';

        // Update autoclipper display
        elements.autoclipperCount.textContent = gameState.autoclippers;
        elements.autoclipperProduction.textContent = gameState.autoclippers * gameState.autoclipperProductionRate;

        // Update autowire display
        elements.autowireCount.textContent = gameState.autowires;
        elements.autowireStatus.textContent = gameState.autowires > 0 ? 'Active' : 'Inactive';

        // Update trust level display
        elements.trustLevelDisplay.textContent = gameState.trustLevel;

        // Update price lock status
        elements.priceLockStatus.textContent = gameState.priceLock ? 'Locked' : 'Unlocked';

        // Update price range display
        elements.priceRangeDisplay.textContent = gameState.priceRangeLevel === 1 ?
            'Normal ($0-$10)' : 'Extended ($0-$100)';

        // Update clicker level display
        const clipsPerClick = gameState.clickerUpgradeLevel + 1;
        elements.clickerLevelDisplay.textContent = `${clipsPerClick} clips/click`;

        // Update sell speed display
        elements.sellSpeedDisplay.textContent = `${gameState.sellSpeedMultiplier}x`;

        // Update autoclipper button text with current price
        elements.buyAutoclipperButton.textContent = `Buy Autoclipper ($${gameState.autoclipperCost.toFixed(2)})`;

        updateProgressBars();
        updateResourceCardColors();
        updateGameStateIndicator();
    }

    // Update progress bars based on resource levels
    function updateProgressBars() {
        // Wire progress (max 100 for visualization)
        const wireProgress = Math.min(100, gameState.wire) / 100 * 100;
        elements.wireProgress.style.width = wireProgress + '%';

        // Paper clips progress (max 50 for visualization)
        const paperclipProgress = Math.min(50, gameState.paperClips) / 50 * 100;
        elements.paperclipProgress.style.width = paperclipProgress + '%';

        // Money progress (max $100 for visualization)
        const moneyProgress = Math.min(100, gameState.money) / 100 * 100;
        elements.moneyProgress.style.width = moneyProgress + '%';

        // Update progress bar colors based on levels
        updateProgressBarColor(elements.wireProgress, gameState.wire);
        updateProgressBarColor(elements.paperclipProgress, gameState.paperClips);
        updateProgressBarColor(elements.moneyProgress, gameState.money);
    }

    // Update progress bar color based on resource level
    function updateProgressBarColor(progressBar, value) {
        if (value < 10) {
            progressBar.className = 'progress-bar critical';
        } else if (value < 30) {
            progressBar.className = 'progress-bar warning';
        } else {
            progressBar.className = 'progress-bar';
        }
    }

    // Update resource card colors based on levels
    function updateResourceCardColors() {
        // Wire card
        if (gameState.wire < 10) {
            elements.wireCard.classList.add('low');
            elements.wireCard.classList.remove('high');
        } else if (gameState.wire >= 50) {
            elements.wireCard.classList.add('high');
            elements.wireCard.classList.remove('low');
        } else {
            elements.wireCard.classList.remove('low', 'high');
        }

        // Paper clips card
        if (gameState.paperClips < 5) {
            elements.paperclipCard.classList.add('low');
            elements.paperclipCard.classList.remove('high');
        } else if (gameState.paperClips >= 20) {
            elements.paperclipCard.classList.add('high');
            elements.paperclipCard.classList.remove('low');
        } else {
            elements.paperclipCard.classList.remove('low', 'high');
        }

        // Money card
        if (gameState.money < 5.00) {
            elements.moneyCard.classList.add('low');
            elements.moneyCard.classList.remove('high');
        } else if (gameState.money >= 20.00) {
            elements.moneyCard.classList.add('high');
            elements.moneyCard.classList.remove('low');
        } else {
            elements.moneyCard.classList.remove('low', 'high');
        }
    }

    // Update game state indicator
    function updateGameStateIndicator() {
        if (gameState.wire < 10) {
            gameState.gameState = 'critical';
            elements.gameStateIndicator.textContent = 'CRITICAL: Low Wire!';
            elements.gameStateIndicator.className = 'game-state-indicator state-critical';
        } else if (gameState.wire < 30) {
            gameState.gameState = 'warning';
            elements.gameStateIndicator.textContent = 'WARNING: Wire Running Low';
            elements.gameStateIndicator.className = 'game-state-indicator state-warning';
        } else {
            gameState.gameState = 'normal';
            elements.gameStateIndicator.textContent = 'Normal Operation';
            elements.gameStateIndicator.className = 'game-state-indicator state-normal';
        }
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

                // Calculate clips to make based on clicker upgrade level
                const clipsToMake = gameState.clickerUpgradeLevel + 1;
                const wireNeeded = clipsToMake;

                if (gameState.wire >= wireNeeded) {
                    gameState.wire -= wireNeeded;
                    gameState.paperClips += clipsToMake;
                    gameState.totalClicks++;
                    gameState.totalPaperClips += clipsToMake;

                    // Visual feedback
                    showFeedback(`Made ${clipsToMake} paper clips!`, "success");

                    // Create click animation
                    createClickAnimation();

                    updateDisplays();
                } else {
                    showFeedback(`You need ${wireNeeded} wire to make ${clipsToMake} paper clips!`, "error");
                }
            } else {
                showFeedback("You need wire to make paper clips!", "error");
            }
        });

        // Buy wire button click with price increase
        elements.buyWireButton.addEventListener('click', function() {
            if (gameState.money >= gameState.wireCost) {
                gameState.money -= gameState.wireCost;
                gameState.wire += 100; // 100 units of wire for current price
                gameState.totalWire += 100;
                gameState.wiresBought++;

                // Increase wire cost every 10 bought (+$1.50 each time) unless price is locked
                if (gameState.wiresBought % 10 === 0 && !gameState.priceLock) {
                    gameState.wireCost += 1.50;
                    showFeedback(`Wire price increased to $${gameState.wireCost.toFixed(2)}!`, "warning");
                }

                // Visual feedback
                showFeedback(`Bought 100 units of wire for $${gameState.wireCost.toFixed(2)}!`, "success");

                updateDisplays();
            } else {
                showFeedback(`Not enough money to buy wire! You need $${gameState.wireCost.toFixed(2)}`, "error");
            }
        });

        // Buy autoclipper button click - FIXED with price increase
        elements.buyAutoclipperButton.addEventListener('click', function() {
            if (gameState.money >= gameState.autoclipperCost) {
                gameState.money -= gameState.autoclipperCost;
                gameState.autoclippers++;
                gameState.autoclickersBought++;

                // Increase autoclipper cost every 5 bought (+$10 each time) unless price is locked
                if (gameState.autoclickersBought % 5 === 0 && !gameState.priceLock) {
                    gameState.autoclipperCost += 10;
                    showFeedback(`Autoclipper price increased to $${gameState.autoclipperCost.toFixed(2)}!`, "warning");
                }

                // Visual feedback
                showFeedback(`Bought 1 autoclipper for $${gameState.autoclipperCost.toFixed(2)}!`, "success");

                // Start autoclipper production if not already running
                if (gameState.autoclippers > 0 && !gameState.autoclipperInterval) {
                    startAutoclipperProduction();
                }

                updateDisplays();
            } else {
                showFeedback(`Not enough money to buy autoclipper! You need $${gameState.autoclipperCost.toFixed(2)}`, "error");
            }
        });

        // Buy autowire button click - FIXED
        elements.buyAutowireButton.addEventListener('click', function() {
            if (gameState.money >= gameState.autowireCost) {
                gameState.money -= gameState.autowireCost;
                gameState.autowires++;

                // Visual feedback
                showFeedback("Bought 1 autowire for $150.00!", "success");

                // Start autowire purchasing if not already running
                if (gameState.autowires > 0 && !gameState.autowireInterval) {
                    startAutowirePurchasing();
                }

                updateDisplays();
            } else {
                showFeedback("Not enough money to buy autowire! You need $150.00", "error");
            }
        });

        // Sell paper clips button click - FIXED to sell individual clips
        elements.sellPaperClipsButton.addEventListener('click', function() {
            if (gameState.paperClips > 0) {
                // Sell at the exact price you set, demand affects sell SPEED not price
                const moneyEarned = gameState.paperClipPrice;
                gameState.money += moneyEarned;
                gameState.paperClips--;
                gameState.totalPaperClips++;

                // Visual feedback
                showFeedback(`Sold 1 paper clip for $${moneyEarned.toFixed(2)}!`, "success");

                updateDisplays();
            } else {
                showFeedback("You don't have any paper clips to sell!", "error");
            }
        });

        // Start automatic selling based on demand
        startAutomaticSelling();

        // Set price button click - FIXED to properly read from input
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

        // Trust upgrade button click - $1000 to double demand
        elements.trustUpgradeButton.addEventListener('click', function() {
            if (gameState.money >= 1000 && gameState.trustLevel === 1) {
                gameState.money -= 1000;
                gameState.trustLevel = 2;

                // Double all demand percentages
                gameState.demandPercentage *= 2;

                // Update display
                updateDisplays();
                showFeedback("Trust upgraded! All demand is now DOUBLED!", "success");
            } else if (gameState.trustLevel === 2) {
                showFeedback("Trust already upgraded to maximum level!", "warning");
            } else {
                showFeedback("You need $1000 to upgrade trust!", "error");
            }
        });

        // Price lock button click - $5000 to lock prices
        elements.priceLockButton.addEventListener('click', function() {
            if (gameState.money >= 5000 && !gameState.priceLock) {
                gameState.money -= 5000;
                gameState.priceLock = true;

                // Store current prices as base prices
                gameState.autoclipperBaseCost = gameState.autoclipperCost;
                gameState.autowireBaseCost = gameState.autowireCost;

                // Update display
                updateDisplays();
                showFeedback("Prices LOCKED! Autoclipper and Autowire costs will not increase anymore!", "success");
            } else if (gameState.priceLock) {
                showFeedback("Prices already locked!", "warning");
            } else {
                showFeedback("You need $5000 to lock prices!", "error");
            }
        });

        // Price range upgrade button click - $10000 to extend price range
        elements.priceRangeButton.addEventListener('click', function() {
            if (gameState.money >= 10000 && gameState.priceRangeLevel === 1) {
                gameState.money -= 10000;
                gameState.priceRangeLevel = 2;

                // Update display
                updateDisplays();
                showFeedback("Price range UPGRADED! You can now set prices up to $100.00!", "success");
            } else if (gameState.priceRangeLevel === 2) {
                showFeedback("Price range already upgraded to maximum level!", "warning");
            } else {
                showFeedback("You need $10000 to upgrade price range!", "error");
            }
        });

        // Clicker upgrade button click - $500 to increase clips per click
        elements.clickerUpgradeButton.addEventListener('click', function() {
            if (gameState.money >= 500) {
                gameState.money -= 500;
                gameState.clickerUpgradeLevel++;

                // Update display
                updateDisplays();
                const clipsPerClick = gameState.clickerUpgradeLevel + 1;
                showFeedback(`Clicker UPGRADED! Now makes ${clipsPerClick} clips per click!`, "success");
            } else {
                showFeedback("You need $500 to upgrade clicker!", "error");
            }
        });

        // Sell speed upgrade button click - $100 to double sell speed
        elements.sellSpeedButton.addEventListener('click', function() {
            if (gameState.money >= 100) {
                gameState.money -= 100;
                gameState.sellSpeedMultiplier *= 2;

                // Update display
                updateDisplays();
                showFeedback(`Sell speed DOUBLED! Now selling at ${gameState.sellSpeedMultiplier}x speed!`, "success");
            } else {
                showFeedback("You need $100 to double sell speed!", "error");
            }
        });
    }

    // Create click animation effect
    function createClickAnimation() {
        const animationElement = document.createElement('div');
        animationElement.className = 'click-animation';

        // Position randomly within the click area
        const clickAreaRect = elements.clickArea.getBoundingClientRect();
        const xPos = Math.random() * (clickAreaRect.width - 20);
        const yPos = Math.random() * (clickAreaRect.height - 20);

        animationElement.style.left = xPos + 'px';
        animationElement.style.top = yPos + 'px';

        elements.clickArea.appendChild(animationElement);

        // Remove animation element after animation completes
        setTimeout(() => {
            animationElement.remove();
        }, 1000);
    }

    // Start wire depletion timer with balanced logic
    function startWireDepletion() {
        gameState.wireDepletionInterval = setInterval(function() {
            if (gameState.wire > 0 && !gameState.wireDepletionPaused) {
                // Adjust depletion rate based on production
                const adjustedDepletionRate = calculateAdjustedDepletionRate();

                gameState.wire = Math.max(0, gameState.wire - adjustedDepletionRate);
                updateDisplays();

                // Check if wire is getting low
                if (gameState.wire < 10 && !gameState.wireDepletionPaused) {
                    gameState.wireDepletionPaused = true;
                    showFeedback("Wire depletion paused! Wire too low (< 10 units)", "warning");
                    elements.depletionStatus.textContent = 'Paused';
                }

                // Show warning when wire is getting low
                if (gameState.wire < 20 && gameState.wire >= 10) {
                    showFeedback("Warning: Wire running low!", "warning");
                }
            }
        }, 2000); // Deplete wire every 2 seconds
    }

    // Start autoclipper production
    function startAutoclipperProduction() {
        if (gameState.autoclipperInterval) {
            clearInterval(gameState.autoclipperInterval);
        }

        gameState.autoclipperInterval = setInterval(function() {
            if (gameState.wire >= 1 && gameState.autoclippers > 0) {
                gameState.wire -= 1;
                gameState.paperClips += gameState.autoclippers;
                gameState.totalPaperClips += gameState.autoclippers;

                // Visual feedback
                showFeedback(`Autoclippers made ${gameState.autoclippers} paper clips!`, "success");

                updateDisplays();
            }
        }, 1000); // Produce every second
    }

    // Start autowire purchasing
    function startAutowirePurchasing() {
        if (gameState.autowireInterval) {
            clearInterval(gameState.autowireInterval);
        }

        gameState.autowireInterval = setInterval(function() {
            if (gameState.wire < gameState.autowireThreshold && gameState.money >= gameState.wireCost) {
                gameState.money -= gameState.wireCost;
                gameState.wire += 100;
                gameState.totalWire += 100;

                // Visual feedback
                showFeedback("Autowire bought 100 units of wire!", "success");

                updateDisplays();
            }
        }, 5000); // Check every 5 seconds
    }

    // Start automatic selling based on demand
    function startAutomaticSelling() {
        // Clear any existing interval
        if (gameState.sellInterval) {
            clearInterval(gameState.sellInterval);
        }

        // Calculate sell interval based on demand percentage
        // 100% demand = 1.25 seconds per clip (1 clip every 1.25 seconds)
        // Higher demand = faster selling
        gameState.sellInterval = setInterval(function() {
            if (gameState.paperClips > 0 && gameState.demandPercentage > 0) {
                // Calculate sell interval: base 1250ms / (demandPercentage / 100) / sellSpeedMultiplier
                // So 100% = 1250ms, 200% = 625ms, 300% = 416ms, etc., then divided by sell speed multiplier
                const sellInterval = 1250 / (gameState.demandPercentage / 100) / gameState.sellSpeedMultiplier;

                // Sell at the exact price you set, demand affects sell SPEED not price
                const moneyEarned = gameState.paperClipPrice;
                gameState.money += moneyEarned;
                gameState.paperClips--;
                gameState.totalPaperClips++;

                // Visual feedback
                showFeedback(`Auto-sold 1 paper clip for $${moneyEarned.toFixed(2)}!`, "success");

                updateDisplays();
            }
        }, 1250); // Base interval for 100% demand
    }

    // Calculate adjusted wire depletion rate based on game state
    function calculateAdjustedDepletionRate() {
        // Base rate
        let rate = gameState.wireDepletionRate;

        // If we have lots of paper clips, increase depletion rate slightly
        if (gameState.paperClips > 20) {
            rate *= 1.2; // 20% faster depletion when producing a lot
        }

        // If wire is getting low, slow down depletion
        if (gameState.wire < 30) {
            rate *= 0.8; // 20% slower when wire is low
        }

        return rate;
    }

    // Update demand based on price with higher demand at lower prices
    function updateDemandBasedOnPrice() {
        if (gameState.priceRangeLevel === 1) {
            // Normal price range: $0.01 - $10.00
            if (gameState.paperClipPrice <= 0.01) {
                gameState.demand = 'Maximum';
                gameState.demandPercentage = 300; // 300% demand at minimum price
            } else if (gameState.paperClipPrice < 0.25) {
                gameState.demand = 'Very High';
                gameState.demandPercentage = 250; // 250% demand
            } else if (gameState.paperClipPrice < 0.50) {
                gameState.demand = 'High';
                gameState.demandPercentage = 200; // 200% demand
            } else if (gameState.paperClipPrice < 0.75) {
                gameState.demand = 'Medium-High';
                gameState.demandPercentage = 150; // 150% demand
            } else if (gameState.paperClipPrice < 1.00) {
                gameState.demand = 'Medium';
                gameState.demandPercentage = 125; // 125% demand
            } else if (gameState.paperClipPrice < 1.50) {
                gameState.demand = 'Medium-Low';
                gameState.demandPercentage = 100; // 100% demand
            } else if (gameState.paperClipPrice < 2.00) {
                gameState.demand = 'Low';
                gameState.demandPercentage = 75; // 75% demand
            } else if (gameState.paperClipPrice < 5.00) {
                gameState.demand = 'Very Low';
                gameState.demandPercentage = 50; // 50% demand
            } else if (gameState.paperClipPrice < 10.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 10; // 10% demand at $5.00-$10.00
            } else {
                gameState.demand = 'None';
                gameState.demandPercentage = 0; // 0% demand at $10.00+
            }
        } else {
            // Extended price range: $0.01 - $100.00 with exact specifications
            // $100.00 = 0% demand
            // $99.00 = 1% demand
            // $98.00 = 2% demand
            // ...
            // $1.00 = 99% demand
            // Below $1.00 = doubling demand

            if (gameState.paperClipPrice >= 100.00) {
                gameState.demand = 'None';
                gameState.demandPercentage = 0; // 0% demand at $100.00
            } else if (gameState.paperClipPrice >= 99.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 1; // 1% demand at $99.00
            } else if (gameState.paperClipPrice >= 98.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 2; // 2% demand at $98.00
            } else if (gameState.paperClipPrice >= 97.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 3; // 3% demand at $97.00
            } else if (gameState.paperClipPrice >= 96.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 4; // 4% demand at $96.00
            } else if (gameState.paperClipPrice >= 95.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 5; // 5% demand at $95.00
            } else if (gameState.paperClipPrice >= 90.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 10; // 10% demand at $90.00
            } else if (gameState.paperClipPrice >= 80.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 20; // 20% demand at $80.00
            } else if (gameState.paperClipPrice >= 70.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 30; // 30% demand at $70.00
            } else if (gameState.paperClipPrice >= 60.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 40; // 40% demand at $60.00
            } else if (gameState.paperClipPrice >= 50.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 50; // 50% demand at $50.00
            } else if (gameState.paperClipPrice >= 40.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 60; // 60% demand at $40.00
            } else if (gameState.paperClipPrice >= 30.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 70; // 70% demand at $30.00
            } else if (gameState.paperClipPrice >= 20.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 80; // 80% demand at $20.00
            } else if (gameState.paperClipPrice >= 10.00) {
                gameState.demand = 'Extremely Low';
                gameState.demandPercentage = 90; // 90% demand at $10.00
            } else if (gameState.paperClipPrice >= 5.00) {
                gameState.demand = 'Low';
                gameState.demandPercentage = 100; // 100% demand at $5.00
            } else if (gameState.paperClipPrice >= 1.00) {
                gameState.demand = 'Medium';
                gameState.demandPercentage = 150; // 150% demand at $1.00
            } else if (gameState.paperClipPrice >= 0.50) {
                gameState.demand = 'High';
                gameState.demandPercentage = 200; // 200% demand at $0.50
            } else if (gameState.paperClipPrice >= 0.25) {
                gameState.demand = 'Very High';
                gameState.demandPercentage = 250; // 250% demand at $0.25
            } else if (gameState.paperClipPrice >= 0.01) {
                gameState.demand = 'Maximum';
                gameState.demandPercentage = 300; // 300% demand at $0.01
            } else {
                gameState.demand = 'Maximum';
                gameState.demandPercentage = 300; // 300% demand at minimum
            }

            // Double demand percentages below $1.00 as requested
            if (gameState.paperClipPrice < 1.00) {
                gameState.demandPercentage *= 2;
            }
        }

        // Update demand display color
        if (gameState.demandPercentage >= 150) {
            elements.demandDisplay.classList.add('high-demand');
            elements.demandDisplay.classList.remove('low-demand', 'no-demand');
        } else if (gameState.demandPercentage === 0) {
            elements.demandDisplay.classList.add('no-demand');
            elements.demandDisplay.classList.remove('high-demand', 'low-demand');
        } else {
            elements.demandDisplay.classList.add('low-demand');
            elements.demandDisplay.classList.remove('high-demand', 'no-demand');
        }

        // Restart automatic selling with new demand rate
        startAutomaticSelling();
    }

    // Show visual feedback with smooth transitions
    function showFeedback(message, type) {
        // Create feedback element
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `feedback-message ${type}`;
        feedbackElement.textContent = message;

        // Add to document
        document.body.appendChild(feedbackElement);

        // Trigger animation
        setTimeout(function() {
            feedbackElement.style.opacity = '1';
            feedbackElement.style.transform = 'translateX(-50%)';
        }, 10);

        // Remove after delay
        setTimeout(function() {
            feedbackElement.style.opacity = '0';
            feedbackElement.style.transform = 'translate(-50%, -30px)';
            setTimeout(function() {
                document.body.removeChild(feedbackElement);
            }, 300);
        }, 2500);
    }

    // Start the game
    initGame();
});