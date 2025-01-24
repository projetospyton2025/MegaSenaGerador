document.addEventListener('DOMContentLoaded', () => {
    const generateSingleBtn = document.getElementById('generateSingle');
    const gamesCountInput = document.getElementById('gamesCount');
    const evenCountSelect = document.getElementById('evenCount');
    const oddCountSelect = document.getElementById('oddCount');
    const downloadTxtBtn = document.getElementById('downloadTxt');
    const downloadXlsxBtn = document.getElementById('downloadXlsx');
    const drawTable = document.getElementById('drawTable').querySelector('tbody');
    const sortedTable = document.getElementById('sortedTable').querySelector('tbody');

    let currentGames = [];

    generateSingleBtn.addEventListener('click', async () => {
        const count = parseInt(gamesCountInput.value);
        const evenCount = evenCountSelect.value !== "" ? parseInt(evenCountSelect.value) : null;
        const oddCount = oddCountSelect.value !== "" ? parseInt(oddCountSelect.value) : null;

        // Validar seleção de pares/ímpares
        if ((evenCount !== null && oddCount === null) || (evenCount === null && oddCount !== null)) {
            alert('Selecione ambos os valores para pares e ímpares ou deixe ambos vazios para geração aleatória');
            return;
        }

        if (evenCount !== null && oddCount !== null && evenCount + oddCount !== 6) {
            alert('A soma de números pares e ímpares deve ser 6');
            return;
        }

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
    });

    function updateTables(games) {
        drawTable.innerHTML = '';
        sortedTable.innerHTML = '';

        games.forEach((game, index) => {
            // Draw order table
            const drawRow = document.createElement('tr');
            drawRow.innerHTML = game.draw_numbers.map((num, i) => {
                const colorClass = num % 2 === 0 ? 'even' : 'odd';
                return i === 0 ? 
                    `<td>${index + 1}</td><td class="${colorClass}">${num}</td>` : 
                    `<td class="${colorClass}">${num}</td>`;
            }).join('');
            drawTable.appendChild(drawRow);

            // Sorted order table
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
});document.addEventListener('DOMContentLoaded', () => {
    const generateSingleBtn = document.getElementById('generateSingle');
    const gamesCountInput = document.getElementById('gamesCount');
    const downloadTxtBtn = document.getElementById('downloadTxt');
    const downloadXlsxBtn = document.getElementById('downloadXlsx');
    const drawTable = document.getElementById('drawTable').querySelector('tbody');
    const sortedTable = document.getElementById('sortedTable').querySelector('tbody');

    let currentGames = [];

    generateSingleBtn.addEventListener('click', async () => {
        const count = parseInt(gamesCountInput.value);
        const response = await fetch('/generate-multiple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `count=${count}`
        });
        const data = await response.json();
        currentGames = data.games;
        updateTables(data.games);
    });

    function updateTables(games) {
        drawTable.innerHTML = '';
        sortedTable.innerHTML = '';

        games.forEach((game, index) => {
            // Draw order table
            const drawRow = document.createElement('tr');
            drawRow.innerHTML = game.draw_numbers.map((num, i) => {
                const colorClass = num % 2 === 0 ? 'even' : 'odd';
                return i === 0 ? 
                    `<td>${index + 1}</td><td class="${colorClass}">${num}</td>` : 
                    `<td class="${colorClass}">${num}</td>`;
            }).join('');
            drawTable.appendChild(drawRow);

            // Sorted order table
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
});