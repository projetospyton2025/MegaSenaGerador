document.addEventListener('DOMContentLoaded', () => {
    const generateSingleBtn = document.getElementById('generateSingle');
    const gamesCountInput = document.getElementById('gamesCount');
    const evenCountSelect = document.getElementById('evenCount');
    const oddCountSelect = document.getElementById('oddCount');
    const downloadTxtBtn = document.getElementById('downloadTxt');
    const downloadXlsxBtn = document.getElementById('downloadXlsx');
    const drawTable = document.getElementById('drawTable').querySelector('tbody');
    const sortedTable = document.getElementById('sortedTable').querySelector('tbody');
    const totalEvenDisplay = document.getElementById('totalEven');
    const evenPercentageDisplay = document.getElementById('evenPercentage');
    const totalOddDisplay = document.getElementById('totalOdd');
    const oddPercentageDisplay = document.getElementById('oddPercentage');
    const mostFrequentDisplay = document.getElementById('mostFrequent');

    let currentGames = [];

    // Busca estatísticas ao carregar
    fetchStats();

    generateSingleBtn.addEventListener('click', async () => {
        const count = parseInt(gamesCountInput.value);
        const evenCount = evenCountSelect.value !== "" ? parseInt(evenCountSelect.value) : null;
        const oddCount = oddCountSelect.value !== "" ? parseInt(oddCountSelect.value) : null;

        // Validação de pares/ímpares
        if ((evenCount !== null && oddCount === null) || (evenCount === null && oddCount !== null)) {
            alert('Selecione ambos os valores para pares e ímpares ou deixe ambos vazios para geração aleatória');
            return;
        }

        if (evenCount !== null && oddCount !== null && evenCount + oddCount !== 6) {
            alert('A soma de números pares e ímpares deve ser 6');
            return;
        }

        try {
            const response = await fetch('/generate-multiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `count=${count}&even_count=${evenCount || ''}&odd_count=${oddCount || ''}`
            });

            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return;
            }

            currentGames = data.games;
            updateTables(data.games);
        } catch (error) {
            console.error('Erro ao gerar jogos:', error);
        }
    });

    function updateTables(games) {
        drawTable.innerHTML = '';
        sortedTable.innerHTML = '';

        games.forEach((game, index) => {
            // Tabela com a ordem sorteada
            const drawRow = document.createElement('tr');
            drawRow.innerHTML = game.draw_numbers.map((num, i) => {
                const colorClass = num % 2 === 0 ? 'even' : 'odd';
                return i === 0 ? 
                    `<td>${index + 1}</td><td class="${colorClass}">${num}</td>` : 
                    `<td class="${colorClass}">${num}</td>`;
            }).join('');
            drawTable.appendChild(drawRow);

            // Tabela com a ordem crescente
            const sortedRow = document.createElement('tr');
            const sortedNumbers = game.sorted_numbers.map(num => {
                const colorClass = num % 2 === 0 ? 'even' : 'odd';
                return `<span class="${colorClass}">${num}</span>`;
            }).join(' ');

            sortedRow.innerHTML = `
                <td>${index + 1}</td>
                <td>${sortedNumbers}</td>
                <td>${game.evens}</td>
                <td>${game.odds}</td>
            `;
            sortedTable.appendChild(sortedRow);
        });
    }

    downloadTxtBtn.addEventListener('click', () => {
        if (currentGames.length === 0) return;
        const gamesStr = currentGames.map(game => game.draw_numbers.join(',')).join(';');
        window.location.href = `/download/txt?games=${gamesStr}`;
    });

    downloadXlsxBtn.addEventListener('click', () => {
        if (currentGames.length === 0) return;
        const gamesStr = currentGames.map(game => game.draw_numbers.join(',')).join(';');
        window.location.href = `/download/xlsx?games=${gamesStr}`;
    });

    async function fetchStats() {
        try {
            const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/megasena');
            const data = await response.json();

            let totalEven = 0;
            let totalOdd = 0;
            const combinations = {};

            data.forEach(concurso => {
                const numbers = concurso.dezenas.map(Number);
                const evens = numbers.filter(n => n % 2 === 0).length;
                const odds = numbers.length - evens;

                totalEven += evens;
                totalOdd += odds;

                const key = `${evens}p${odds}`;
                combinations[key] = (combinations[key] || 0) + 1;
            });

            const totalNumbers = totalEven + totalOdd;
            const evenPercentage = ((totalEven / totalNumbers) * 100).toFixed(1);
            const oddPercentage = ((totalOdd / totalNumbers) * 100).toFixed(1);

            // Encontra combinação mais frequente
            const mostFrequent = Object.entries(combinations)
                .sort((a, b) => b[1] - a[1])[0];
            const [evens, odds] = mostFrequent[0].split('p');


            totalEvenDisplay.textContent = totalEven;
            evenPercentageDisplay.textContent = `${evenPercentage}%`;
            totalOddDisplay.textContent = totalOdd;
            oddPercentageDisplay.textContent = `${oddPercentage}%`;
            mostFrequentDisplay.textContent = 
                `${evens.replace('','')} pares e ${odds} ímpares`;

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        }
    }
});
