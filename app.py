from flask import Flask, render_template, jsonify, request, send_file
import random
import pandas as pd
from io import BytesIO
import os

app = Flask(__name__)

# CÓDIGO1
def generate_numbers(even_count=None, odd_count=None):
    limits = [55, 56, 57, 58, 59, 60]
    numbers = []
    used_numbers = set()
    
    # Modo específico: quantidades definidas de pares/ímpares
    if even_count is not None and odd_count is not None:
        if even_count + odd_count != 6:
            return None
            
        # Gerar pares
        remaining_even = even_count
        col = 0
        while remaining_even > 0:
            max_num = limits[col]
            while True:
                num = random.randint(1, max_num)
                if num % 2 == 0 and num not in used_numbers:
                    numbers.append(num)
                    used_numbers.add(num)
                    remaining_even -= 1
                    col += 1
                    break
        
        # Gerar ímpares
        remaining_odd = odd_count
        while remaining_odd > 0:
            max_num = limits[col]
            while True:
                num = random.randint(1, max_num)
                if num % 2 != 0 and num not in used_numbers:
                    numbers.append(num)
                    used_numbers.add(num)
                    remaining_odd -= 1
                    col += 1
                    break
    
    # Modo aleatório: sem restrições de paridade
    else:
        for col, max_num in enumerate(limits):
            while True:
                num = random.randint(1, max_num)
                if num not in used_numbers:
                    numbers.append(num)
                    used_numbers.add(num)
                    break
    
    return numbers

def count_odd_even(numbers):
    evens = len([n for n in numbers if n % 2 == 0])
    odds = len(numbers) - evens
    return odds, evens

# Adaptação do CÓDIGO2
def verify_result(numbers, even_count=None, odd_count=None):
    if numbers is None:
        return False
    if len(numbers) != 6:
        return False
    if even_count is not None:
        actual_evens = len([n for n in numbers if n % 2 == 0])
        if actual_evens != even_count:
            return False
    if odd_count is not None:
        actual_odds = len([n for n in numbers if n % 2 != 0])
        if actual_odds != odd_count:
            return False
    return True

@app.route('/generate-multiple', methods=['POST'])
def generate_multiple():
    count = int(request.form.get('count', 1))
    even_count = request.form.get('even_count')
    odd_count = request.form.get('odd_count')
    
    if even_count:
        even_count = int(even_count)
    if odd_count:
        odd_count = int(odd_count)
    
    games = []
    attempts = 0
    max_attempts = count * 100  # Aumenta tentativas para encontrar combinações válidas
    
    while len(games) < count and attempts < max_attempts:
        numbers = generate_numbers(even_count, odd_count)
        if numbers is not None and verify_result(numbers, even_count, odd_count):
            sorted_numbers = sorted(numbers)
            odds, evens = count_odd_even(numbers)
            games.append({
                'draw_numbers': numbers,
                'sorted_numbers': sorted_numbers,
                'odds': odds,
                'evens': evens
            })
        attempts += 1
    
    return jsonify({'games': games})

# RESTO DO CÓDIGO1 (INALTERADO)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    even_count = request.form.get('even_count')
    odd_count = request.form.get('odd_count')
    
    if even_count and odd_count:
        even_count = int(even_count)
        odd_count = int(odd_count)
    else:
        even_count = odd_count = None
    
    numbers = generate_numbers(even_count, odd_count)
    if numbers is None:
        return jsonify({'error': 'Não foi possível gerar números com as restrições fornecidas'})
        
    sorted_numbers = sorted(numbers)
    odds, evens = count_odd_even(numbers)
    
    return jsonify({
        'draw_numbers': numbers,
        'sorted_numbers': sorted_numbers,
        'odds': odds,
        'evens': evens
    })

@app.route('/download/<format>')
def download(format):
    games_data = request.args.get('games', '').split(';')
    
    if format == 'txt':
        output = BytesIO()
        content = "MSOrdemSorteio - Jogos Gerados\n\n"
        
        for i, game in enumerate(games_data, 1):
            if game:
                numbers = [int(n) for n in game.split(',')]
                content += f"Jogo {i}:\n"
                content += f"Ordem de sorteio: {numbers}\n"
                content += f"Ordem crescente: {sorted(numbers)}\n\n"
        
        output.write(content.encode('utf-8'))
        output.seek(0)
        return send_file(output, mimetype='text/plain', as_attachment=True, download_name='jogos.txt')
    
    elif format == 'xlsx':
        output = BytesIO()
        df_data = []
        
        for game in games_data:
            if game:
                numbers = [int(n) for n in game.split(',')]
                df_data.append({
                    'Ordem de sorteio': str(numbers),
                    'Ordem crescente': str(sorted(numbers))
                })
        
        df = pd.DataFrame(df_data)
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        
        output.seek(0)
        return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        as_attachment=True, download_name='jogos.xlsx')

"""
if __name__ == '__main__':
    app.run(debug=True)
"""


# Agora a parte de configuração da porta
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))  # Obtém a porta do ambiente ou usa 5000 como padrão
    app.run(host="0.0.0.0", port=port)  # Inicia o servidor Flask na porta correta
