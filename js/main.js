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
	console.log(quadrados_linha)

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

   var i = 0;
   var j = 0;
  cell.enter().append("rect")
    .attr("width", 0)
    .attr("height", cellSize)
    .attr("x", function(d) {
      var x0 = Math.floor(i % quadrados_linha)
      i += 1
      return (cellSpacing + cellSize) * (x0);      
    })    
    .attr("y", function(d) {
      var y0 = Math.floor(j / quadrados_linha)
      j +=1
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
  
  $('#input-cidade').typeahead({source:cidades})
  //.on()

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
  				desenha_grafico('genero');
  				break;  			
  		}
	});

  //baixa dados e inicializa
  d3.csv("http://estadaodados.com/vereadores2016/dados/sexo_raca_ver.csv", function(data) {
  	window.data = data;
    arruma_dados();
  	desenha_grafico('fake');

  });
});
