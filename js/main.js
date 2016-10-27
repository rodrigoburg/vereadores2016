// Retorna um número aleatório min (inclusivo) e max (exclusivo)
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var width = Math.min($('body').width(), 960),
    height = 990,
    cellSpacing = 1,
    offset = 10,
    cidades = [],
    variavel_selec = 'genero',
    uf_selec = 'Brasil',
    data, dados_ordenados, i_antigo;

var tooltip = d3.selectAll(".tooltipi")

var svg = d3.select("#grafico").append("svg");

svg.attr("width", width)
    .attr("height", height);

var cell = svg.append("g")
    .attr("class", "cells")
    .attr("transform", "translate(" + offset + ",0)")
    .selectAll("rect");

function arruma_dados() {
    window.data.forEach(function(d) {
    	d['genero'] = parseFloat(d['homem_dif'])
    	d['raca'] = parseFloat(d['branco_dif'])
        d['fake'] = getRandomArbitrary(-10, 10)
        window.cidades.push(d['nome'] + '-' + d['uf'])
    })
}

function arruma_input() {
    var input = $('#input-cidade')
    teste = input.typeahead({
        source: cidades,
        items:2
    })

    input.keypress(function (){    	
    	var texto = input.val()
    	if (cidades.indexOf(texto)>-1) {
    		//acha o quadrado
    		var i = 0;
    		var valor;
    		window.dados_ordenados.every(function(element, index) {
				    if (element['nome']+'-'+element['uf'] == texto) {				    	
				        i = index;
				        valor = element[variavel_selec];
				        return false;
				    }
				    else return true;
				});
    		window.i_antigo = i;
    		d3.select($('rect')[i]).attr('stroke', 'black')
            var valor = formata(valor)
            var sinal = 'mais'
            if (valor < 0) {
            	sinal = 'menos'
            }
            var nome_var = 'masculina'
            if (variavel_selec == 'raca') {
            	nome_var = 'branca'
            }
            tooltip.html('<b>'+(i+1)+'.</b> '+texto+ ': a Câmara é <b>' + Math.abs(valor) +'</b> pontos percentuais '+sinal+' '+nome_var+' que a população')
    	}
    })

}

function formata(d) {
	return Math.round(d * 100) / 100 
}

function desenha_grafico(variavel, uf) {
    svg.selectAll('.explicacao_fake').transition()
        .duration(500)
        .remove();
 
	  svg.selectAll('rect').transition()  
	    .duration(500)
		.attr("width", 0)
		.remove();

    tooltip.html('<p style="color:white">vazio</p>');

    d3.select('.linha_divisao').transition().duration(500).remove()

    if (uf) {
        if (uf != 'Brasil') {
            dados = window.data.filter(function(d) {
                return d.uf == uf
            });
        } else {
            dados = window.data;
        }
    } else {
        dados = window.data;
    }

    window.dados_ordenados = dados;

    var quadrados_linha = Math.floor(Math.floor(Math.sqrt(dados.length) * 1.5)*(width/960));
    var cellSize = Math.floor((width) / quadrados_linha) - cellSpacing;

    var max = d3.max(dados, function(d) {
        return d[variavel];
    })
    var min = d3.min(dados, function(d) {
        return d[variavel];
    })

    //espera 1s pra não encavalar com a animação de fadeout do gráfico anterior
    setTimeout(function() {

        dados.sort(function(a, b) {
            return a[variavel] - b[variavel];
        });

        var color = d3.scaleLinear()
            .domain([min, 0, max])
            .range(["#054A91", 'white', "#FF1654"]);

        cell = cell
            .data(dados);

        var divisor = 0;
        cell.enter().append("rect")
            .attr("width", 0)
            .attr("height", cellSize)
            .attr("x", function(d, i) {
                if (d[variavel] < 0) {
                    divisor = i;
                }
                var x0 = Math.floor(i % quadrados_linha)
                return (cellSpacing + cellSize) * (x0);
            })
            .attr("y", function(d, j) {
                var y0 = Math.floor(j / quadrados_linha)
                return (cellSpacing + cellSize) * (y0);
            })
            .attr('fill', function(d) {
                return color(d[variavel])
            })
            .on('mouseover', function(d,i) {
                d3.select(this).attr('stroke', 'black')
                var valor = formata(d[variavel])
                var sinal = 'mais'
                if (valor < 0) {
                	sinal = 'menos'
                }
                var nome_var = 'masculina'
                if (variavel == 'raca') {
                	nome_var = 'branca'
                }
                tooltip.html('<b>'+(i+1)+'.</b> '+d['nome'] + '-' + d['uf'] + ': a Câmara é <b>' + Math.abs(valor) +'</b> pontos percentuais '+sinal+' '+nome_var+' que a população')
            })
            .on('mouseleave', function() {
                d3.select(this).attr('stroke', '')
                d3.select($('rect')[window.i_antigo]).attr('stroke', '')
    			tooltip.html('<p style="color:white">vazio</p>');
            })
            .transition()
            .delay(500)
            .duration(1500)
            .attr("width", cellSize);

        //coloca a linha cinza pontilhada que separa os dois grupos

        divisor = divisor+1;

        var x_min = offset;
        var x0 = offset + Math.max((cellSpacing + cellSize) * Math.floor((divisor) % quadrados_linha), x_min);
        var y1 = (cellSpacing + cellSize) + ((cellSpacing + cellSize) * Math.floor(divisor / quadrados_linha));
        var y0 = y1 - (cellSpacing + cellSize);
        var x_fim = offset + (cellSpacing + cellSize) + (cellSpacing + cellSize) * Math.floor((quadrados_linha - 1) % quadrados_linha)

        var dados_linha = [{
            'x': x_min,
            'y': y1
        }, {
            'x': x0,
            'y': y1
        }, {
            'x': x0,
            'y': y0
        }, {
            'x': x_fim,
            'y': y0
        }]
        var funcao_linha = d3.line()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            })

        var lineGraph = svg.append("path")
            .attr("d", funcao_linha(dados_linha))
            .attr("class", "linha_divisao")            
            .attr('opacity', 0)
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .transition()
            .duration(1000)
            .attr('opacity', 0.9)
            .attr("stroke", "gray")
            .attr("stroke-dasharray", 2);

        //cria os quadradinhos para mostrar o que cada grupo significa
        if (variavel == 'fake') {
            var meio_x = x_fim / 2
            var largura = 125
            x0 = meio_x - (largura / 2)

            var altura = (largura / 4) + 7
            y0 = (y1 / 2) - (altura / 2)

            var quadrado = svg.append("g")
                .attr('class', 'explicacao_fake')
                .attr('transform', 'translate(' + x0 + ',' + y0 + ')')

            quadrado.append("rect")
                .attr("width", largura)
                .attr("height", altura)
                .attr('opacity', 0.8)
                .attr('fill', 'white')

            var texto = quadrado.append("text")
                .attr('x', 5)
                .attr('y', 7)
                .attr("dy", ".4em")
                .attr('font-size', '0.8rem')

            texto.append("tspan")
                .attr('x', 5)
                .text('Cidades em que há')

            texto.append("tspan")
                .attr('x', 5)
                .attr('y', 21)
                .text('proporção MENOR')

            texto.append("tspan")
                .attr('x', 5)
                .attr('y', 32)
                .text('de brancos na Câmara')

            y0 = (y1 * 1.5) - (altura / 2)

            var quadrado = svg.append("g")
                .attr('class', 'explicacao_fake')
                .attr('opacity', 0.8)
                .attr('transform', 'translate(' + x0 + ',' + y0 + ')')

            quadrado.append("rect")
                .attr("width", largura)
                .attr("height", altura)
                .attr('fill', 'white')

            var texto = quadrado.append("text")
                .attr('x', 5)
                .attr('y', 7)
                .attr("dy", ".4em")
                .attr('font-size', '0.8rem')

            texto.append("tspan")
                .attr('x', 5)
                .text('Cidades em que há')

            texto.append("tspan")
                .attr('x', 5)
                .attr('y', 21)
                .text('proporção MAIOR')

            texto.append("tspan")
                .attr('x', 5)
                .attr('y', 32)
                .text('de brancos na Câmara')
        } else {
            d3.selectAll('.explicacao_fake').transition(500).remove();
        }
    }, 1000); // How long do you want the delay to be (in milliseconds)? 

}

$(document).ready(function() {
    
    //liga a funcionalidade dos selects
    $('#variavel').on('hidden.bs.select', function(e) {
        var traduz = {
            'Gênero': 'genero',
            'Raça': 'raca'
        }

        var temp = traduz[$(this).find("option:selected").text()]
        if (temp != variavel_selec) {
            variavel_selec = temp;
            desenha_grafico(variavel_selec, uf_selec);
        }
    });

    $('#uf').on('hidden.bs.select', function(e) {
        var temp = $(this).find("option:selected").text()
        if (temp != uf_selec) {
            uf_selec = temp;
            desenha_grafico(variavel_selec, uf_selec);
        }
    });


    //baixa dados e inicializa
    d3.csv("dados/sexo_raca_ver.csv", function(data) {
        window.data = data;
        cidades.sort();
        arruma_dados();
        arruma_input();
        desenha_grafico('fake');

    });
});