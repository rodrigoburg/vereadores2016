// Retorna um número aleatório min (inclusivo) e max (exclusivo)
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

var width = 960,
	height = 990,
    groupSpacing = 3,
    cellSpacing = 1,
    cellSize = Math.floor((width - 11 * groupSpacing) / 100) - cellSpacing,
    offset = Math.floor((width - 100 * cellSize - 90 * cellSpacing - 11 * groupSpacing) / 2),
    cidades = [],
    variavel_selec = 'genero', 
    uf_selec = 'Brasil',
    data;

var tooltip = d3.select("#tooltip")

var svg = d3.select("#grafico").append("svg");

svg.attr("width",width)
 	.attr("height",height);

var cell = svg.append("g")
    .attr("class", "cells")
    .attr("transform", "translate(" + offset + ",0)")
    .selectAll("rect");

function arruma_dados() {
  window.data.forEach(function(d) {
    d['raca'] = parseFloat(d['%branco_ver'].replace(',', '.')) - parseFloat(d['%branco_pop'].replace(',', '.'))
    d['genero'] = parseFloat(d['%homem_ver'].replace(',', '.')) - parseFloat(d['%homem_pop'].replace(',', '.'))
    d['fake'] = getRandomArbitrary(-10,10)
    window.cidades.push(d['nome']+'-'+d['uf'])
  })

}

function desenha_grafico(variavel,uf) {
  svg.selectAll('rect').transition()  
    .duration(500)
	.attr("width", 0)
	.remove();

	dados = window.data;
	if (uf) {
		if (uf != 'Brasil') {
			dados = window.data.filter(function(d) { return d.uf == uf });
		}		
	} 

	var quadrados_linha = Math.floor(Math.sqrt(dados.length)*1.5);

	dados.sort(function(a, b) {
		return a[variavel] - b[variavel];
	});

  var max = d3.max(dados, function(d) {
    return d[variavel];
  })
  var min = d3.min(dados, function(d) {
    return d[variavel];
  })

  var color = d3.scaleLinear()
    .domain([min, 0, max])
    .range(["#19323C", 'white', "#A93F55"]);

  cell = cell
  	.data(dados);    
    //.data(d3.range(data.length));    

    var divisor = 0;
	cell.enter().append("rect")
	    .attr("width", 0)
	    .attr("height", cellSize)
	    .attr("x", function(d,i) {	    	
	      if (d[variavel]<0) {
	      	divisor = i;
	      } 
	      var x0 = Math.floor(i % quadrados_linha)
	      return (cellSpacing + cellSize) * (x0);      
	    })    
	    .attr("y", function(d,j) {
	      var y0 = Math.floor(j / quadrados_linha)
	      return (cellSpacing + cellSize) * (y0);
	    })
	    .attr('fill', function(d) {    	    	
	      return color(d[variavel])
	    })
	    .on('mouseover', function(d) {
	      d3.select(this).attr('stroke', 'black')
	      tooltip.html(d['nome'] + '-' + d['uf'] + ': ' + d[variavel])

	    })
	    .on('mouseleave', function() {
	      d3.select(this).attr('stroke', '')
	      tooltip.html("Passe o mouse");
	    })
	  .transition()
	  	.delay(500)
	    .duration(1500)
	    .attr("width", cellSize);

	$('.linha_divisao').remove()

	var x_min = (cellSpacing + cellSize)*2
    var x0 = Math.max((cellSpacing + cellSize) * Math.floor((divisor +3) % quadrados_linha),x_min);
    var y1 = (cellSpacing + cellSize) + ((cellSpacing + cellSize) * Math.floor(divisor / quadrados_linha));
    var y0 = y1 - (cellSpacing + cellSize);
    var x_fim = (cellSpacing + cellSize)  * Math.floor((quadrados_linha -1) % quadrados_linha)

    var dados_linha = [{'x':x_min, 'y':y1},{'x':x0,'y':y1},{'x':x0,'y':y0},{'x':x_fim,'y':y0}]
    var funcao_linha = d3.line()
                          .x(function(d) { return d.x; })
                          .y(function(d) { return d.y; })

	var lineGraph = svg.append("path")
                        .attr("d", funcao_linha(dados_linha))
                        .attr("class","linha_divisao")
                        .attr("stroke", "gray")
                        .attr('opacity',0.9)
                        .attr("stroke-width", 2)
                        .attr("stroke-dasharray",2)
                        .attr("fill", "none");

    if (variavel == 'fake') {
    	var meio_x = x_fim/2
    var largura = meio_x/4
    x0 = meio_x - (largura/2)    
    	
    var altura = largura/4
    y0 = (y1/2) - (altura/2)

    var quadrado = svg.append("g")
    	.attr('class','explicacao_fake')
    	.attr('transform','translate('+x0+','+y0+')')
    
    quadrado.append("rect")
		    .attr("width", largura)
		    .attr("height", altura)
		    .attr('opacity',0.7)
		    .attr('fill','white')
	
	var texto = quadrado.append("text")
			.attr('x',0)
			.attr('y',0)
		    .attr("dy", ".4em")
		    .attr('font-size','0.8rem')
	
	texto.append("tspan")
			.attr('x',0)
			.text('cidades em que há')

	texto.append("tspan")
			.attr('x',0)
			.attr('y',15)
			.text('proporção MENOR')

	texto.append("tspan")
			.attr('x',0)
			.attr('y',25)
			.text('de brancos na câmara')

	y0 = (y1*1.5) - (altura/2)
	
    var quadrado = svg.append("g")
    	.attr('class','explicacao_fake')
    	.attr('opacity',0.7)
    	.attr('transform','translate('+x0+','+y0+')')
    
    quadrado.append("rect")
		    .attr("width", largura)
		    .attr("height", altura)
		    .attr('fill','white')
	
	var texto = quadrado.append("text")
			.attr('x',0)
			.attr('y',0)
		    .attr("dy", ".4em")
		    .attr('font-size','0.8rem')
	
	texto.append("tspan")
			.attr('x',0)
			.text('cidades em que há')

	texto.append("tspan")
			.attr('x',0)
			.attr('y',15)
			.text('proporção MAIOR')

	texto.append("tspan")
			.attr('x',0)
			.attr('y',25)
			.text('de brancos na câmara')
    } else {
    	d3.selectAll('.explicacao_fake').transition(500).remove();
    }
    

}

$(document).ready(function(){  
  //liga o scroll do conteúdo
  $('.barra_superior').slick({         
    speed: 300,
    slidesToScroll: 1,
    dots:true,
    arrows: true,
    infinite: false
  });

  //liga a funcionalidade dos selects
  $('#variavel').on('hidden.bs.select', function (e) {  	    
  	    var traduz = {
  	    	'Gênero':'genero',
  	    	'Raça':'raca'
  	    }

  	    variavel_selec = traduz[$(this).find("option:selected").text()];
  	    desenha_grafico(variavel_selec,uf_selec);  
	});

	$('#uf').on('hidden.bs.select', function (e) {
  	    uf_selec = $(this).find("option:selected").text();
  	    desenha_grafico(variavel_selec,uf_selec);  
	});


  $('.barra_superior').on('afterChange', function(slick, currentSlide, nextSlide){
  		var slide = currentSlide.currentSlide
  		switch (slide) {
  			case 0:
  				desenha_grafico('fake');
  				break;
  			case 1:
  				desenha_grafico('raca');
  				break;
  			case 2:
  				desenha_grafico('raca','RJ');
  				break;  			
  			case 3:
  				desenha_grafico('raca','AC');
  				break;  	
  			case 4:
  				desenha_grafico('genero');
  				break;  			
  			case 5:
  				desenha_grafico('genero',"MG");
  				break;  					
  			case 6:
  				desenha_grafico('genero',"Brasil");
  				break;  					
  		}
	});

  //baixa dados e inicializa
  d3.csv("http://estadaodados.com/vereadores2016/dados/sexo_raca_ver.csv", function(data) {
  	window.data = data;
    arruma_dados();
    $('#input-cidade').typeahead({source:cidades})
  	desenha_grafico('fake');

  });
});
