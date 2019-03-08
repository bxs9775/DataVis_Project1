'use strict';

let dataURL = 'board-game-data.csv';
var dataset = {};
var totalGames = 0;
var categoryData = {};
var mechanicData = {};

// Formatting
// Dimensions used by all charts
let formatTemplate = {
  width: 1000,
  height: 1000,
  xLeftPadding: 160,
  xRightPadding: 16,
  yInnerPadding: 0.2,
  yBottomPadding: 16,
  xAdjust: 0,
};
formatTemplate.xAxisOff = formatTemplate.yBottomPadding;
formatTemplate.yAxisOff = formatTemplate.xLeftPadding;
let spanChartOff = 360;

let tooltipXOff = 8;
let tooltipYOff = 24;

let defaultColor = '#a8a6ac';
let hoverColor = '#007dfd';

let transition = 600;

// Chart info and elements
var currChartId = '';
let charts = [];

//Elements
var chartDiv = {};
var tooltipDiv = {};

// Data fetching functions
let getId = (d) => d.id;

let getCount = (d) => d.count;
let getName = (d) => d.name;

let getCategory = (d) => d.category;
let getMechanic = (d) => d.mechanic;

let getMinPlayers = (d) => d.players.min;
let getMaxPlayers = (d) => d.players.max;
let getMinPlaytime = (d) => d.playtime.min;
let getMaxPlaytime = (d) => d.playtime.max;

//data sorting functions
let sortCount = (a,b) => b.count-a.count;
let sortRank = (a,b) => b.rank-a.rank;

//other functions
let playtimeFormat = (num) => {
  if(!num){
    return '0 min';
  }
  let str = '';
  let hours = Math.floor(num/60);
  let minutes = num%60;
  if(hours){
    str = str.concat(`${hours} hrs`);
  }
  if(hours && minutes){
    str = str.concat(' ');
  }
  if(minutes){
    str = str.concat(`${minutes} min`)
  }
  return str;
}

//Tooltip and mouseover methods
function displayTooltip(x,y){
  tooltipDiv
    .style('left',`${x+tooltipXOff}px`)
    .style('top',`${y+tooltipYOff}px`)
    .classed('hidden',false);
}

function categoricalTooltip(bar,count,total,category,type){
  tooltipDiv.selectAll('*').remove();
  
  tooltipDiv.append('p')
    .text(category)
    .attr('class','tooltipLabel');
  tooltipDiv.append('p')
    .text(`${count} out of  ${total} games in the selection have the ${type} ${category}.`);
  
  displayTooltip(1*bar.attr('x'),1*bar.attr('y'));
}

function gameTooltip(bar,data,playerTooltip){
  tooltipDiv.selectAll('*').remove();
  
  tooltipDiv.append('p')
    .text(`${data.name} (${data.year})`)
    .attr('class','tooltipLabel');
  tooltipDiv.append('p').text(`Categories: ${data.categories.join(', ')}`);
  tooltipDiv.append('p').text(`Mechanics: ${data.mechanics.join(', ')}`);
  let playerText = tooltipDiv.append('p').text(`Number of players: ${data.players.min}-${data.players.max}`);
  let playtimeMin = playtimeFormat(data.playtime.min);
  let playtimeMax = playtimeFormat(data.playtime.max);
  let playtimeAvg = playtimeFormat(data.playtime.avg);
  let playtimeText = tooltipDiv.append('p').text(`Playtime: ${playtimeMin}-${playtimeMax}, adverage playtime: ${playtimeAvg}`);
  
  if(playerTooltip){
    playerText.attr('class','focus');
  } else {
    playtimeText.attr('class','focus');
  }
  
  displayTooltip(spanChartOff,1*bar.attr('y'));
}

function barOver(bar){
  bar.transition('mouseOver')
    .duration(transition)
    .style('fill',hoverColor);
}

function barOut(data){
  d3.select(this)
    .transition('mouseOff')
    .duration(transition)
    .style('fill',defaultColor);
  
  
  tooltipDiv.classed('hidden',true);
}

//Charting functions
function createYScale(format,data,getY){
  let yScale = d3.scaleBand()
    .domain(data.map(getY))
    //Rangeround has been producing undesirable extra-space at the ends of charts. Switching to range...
    .range([0,format.height-format.yBottomPadding])
    .paddingInner(format.yInnerPadding);
  return yScale;
}

function createAxes(chart,format,xScale,yScale,tickFormat=null){
  var xAxis = d3.axisBottom(xScale);
  if(tickFormat){
    xAxis.tickFormat(tickFormat);
  }
  var yAxis = d3.axisLeft(yScale);
  
  chart.append('g')
    .attr('class', 'xaxis axis')
    .attr('transform', `translate(${format.yAxisOff-format.xAdjust},${format.height-format.xAxisOff})`)
    .call(xAxis);
  
  chart.append('g')
    .attr('class', 'yaxis axis')
    .attr('transform', `translate(${format.yAxisOff},0 )`)
    .call(yAxis);
  
  
  return {
    xAxis: xAxis,
    yAxis: yAxis
  }
}

function createBarChart(id,data,key,getX,getY,mouseOver){
  
  //Format details
  let format = Object.assign({},formatTemplate);
  
  //Create scales
  let xMax = d3.max(data,getX);
  let xScale = d3.scaleLinear()
    .domain([0,xMax])
    .rangeRound([0,format.width-(format.xLeftPadding+format.xRightPadding)]);
  
  let yScale = createYScale(format,data,getY);
  
  //Create svg chart
  let chart = chartDiv.append('svg')
    .attr('width',0)
    .attr('height',format.height)
    .attr('id',id)
    .classed('hidden',true);
  
  chart.selectAll('rect')
    .data(data,key)
    .enter()
    .append('rect')
    .attr('x',format.xLeftPadding)
    .attr('y',(d) => yScale(getY(d)))
    .attr('width',(d) => xScale(getX(d)))
    .attr('height',yScale.bandwidth())
    .style('fill',defaultColor)
    .on('mouseover',mouseOver)
    .on('mouseout',barOut);
  
  //Axis
  let axes = createAxes(chart,format,xScale,yScale);
  
  return {
    id: id,
    format: format,
    xScale: xScale,
    yScale: yScale,
    xAxis: axes.xAxis,
    yAxis: axes.yAxis,
  };
}

function createSpanChart(id,data,key,getMinX,getMaxX,getY,mouseOver,tickFormat=null){
  //Format details
  let format = Object.assign({},formatTemplate);
  format.xLeftPadding = spanChartOff;
  format.xRightPadding = 36;
  format.yAxisOff = format.xLeftPadding;
  format.xAdjust = format.xLeftPadding;
  
  //Create scales
  let xMax = d3.max(data,getMaxX);
  let xScale = d3.scaleLinear()
    .domain([0,xMax])
    .rangeRound([format.xLeftPadding,format.width-format.xRightPadding]);
  
  let yScale = createYScale(format,data,getY);
  
  //Create svg chart
  let chart = chartDiv.append('svg')
    .attr('width',0)
    .attr('height',format.height)
    .attr('id',id)
    .classed('hidden',true);
  
  chart.selectAll('rect')
    .data(data,key)
    .enter()
    .append('rect')
    .attr('x',(d) => xScale(getMinX(d)))
    .attr('y',(d) => yScale(getY(d)))
    .attr('width',(d) => (xScale(getMaxX(d))-xScale(getMinX(d)) || 1))
    .attr('height',yScale.bandwidth())
    .style('fill',defaultColor)
    .on('mouseover',mouseOver)
    .on('mouseout',barOut);
  
  //Axis
  let axes = createAxes(chart,format,xScale,yScale,tickFormat);
  
  return {
    id: id,
    format: format,
    xScale: xScale,
    yScale: yScale,
    xAxis: axes.xAxis,
    yAxis: axes.yAxis,
  };
}

function createCategoryChart(data=categoryData,total=totalGames){
  data.sort(sortCount);
  
  let mouseOver = function(d){
    let bar = d3.select(this);
    
    barOver(bar);
    categoricalTooltip(bar,d.count,total,d.category,'category');
  };
  
  return createBarChart('category',data,getCategory,getCount,getCategory,mouseOver);
}

function createMechanicsChart(data=mechanicData,total=totalGames){
  data.sort(sortCount);
  
  let mouseOver = function(d){
    let bar = d3.select(this);
    
    barOver(bar);
    categoricalTooltip(bar,d.count,total,d.mechanic,'mechanic');
  };
  
  return createBarChart('mechanics',data,getMechanic,getCount,getMechanic,mouseOver);
}

function createPlayersChart(data=dataset){
  data.sort(sortRank);
  
  let mouseOver = function(d){
    let bar = d3.select(this);
    
    barOver(bar);
    gameTooltip(bar,d,true);
  }
  
  return createSpanChart('numPlayers',data,getId,getMinPlayers,getMaxPlayers,getName,mouseOver);
}

function createPlaytimeChart(data=dataset){
  data.sort(sortRank);
  
  let mouseOver = function(d){
    let bar = d3.select(this);
    
    barOver(bar);
    gameTooltip(bar,d,false);
  }
  
  return createSpanChart('playTime',data,getId,getMinPlaytime,getMaxPlaytime,getName,mouseOver,playtimeFormat);
}

function collapseChart(id){
  let chart = d3.select(`#${id}`);
  chart.transition('collapseChart')
    .duration(transition)
    .attr('width',0).on('end',function(){
      if(id != currChartId){
        d3.select(this).classed('hidden',true);
      }
    });
}

function expandChart(id){
  let chart = d3.select(`#${id}`);
  chart.classed('hidden',false);
  chart.transition('expandChart')
    .duration(transition)
    .attr('width',charts[id].format.width);
  
  currChartId = id;
}

function changeChart(){
  let chartType = d3.select(this).node().value;
  
  collapseChart(currChartId);
  expandChart(chartType);
}

//Helper functions

function getArrayValuesCount(data, getArray){
  let counts = {};
  
  let values = data.map(getArray).flat();
  
  //unique values counting solution from https://stackoverflow.com/questions/12749200/how-to-count-array-elements-by-each-element-in-javascript
  for(var i = 0; i < values.length; i++){
    counts[values[i]] = (counts[values[i]]+1) || 1;
  }
  let entries = Object.entries(counts);
  return entries;
}

function getCategoriesArray(data){
  return getArrayValuesCount(data,(d) => d.categories).map((entry) => {
    return {
      category: entry[0],
      count: entry[1]
    }
  });
}

function getMechanicsArray(data){
  return getArrayValuesCount(data,(d) => d.mechanics).map((entry) => {
    return {
      mechanic: entry[0],
      count: entry[1]
    }
  });
}

function processData(data){
  dataset = data;
  totalGames = dataset.length;
  
  categoryData = getCategoriesArray(data);
  mechanicData = getMechanicsArray(data);
  
  charts['category'] = createCategoryChart();
  charts['mechanics'] = createMechanicsChart();
  charts['numPlayers'] = createPlayersChart();
  charts['playTime'] = createPlaytimeChart();
  
  expandChart('category');
  
  d3.select('#dataViews').on('change',changeChart);
}

function rowConverter(data){
  return {
    rank: parseInt(data.rank),
    id: data.game_id,
    name: data.names,
    year: data.year,
    players: {
      min: parseInt(data.min_players),
      max: parseInt(data.max_players)
    },
    playtime: {
      min: parseInt(data.min_time),
      avg: parseInt(data.avg_time),
      max: parseInt(data.max_time)
    },
    mechanics: data.mechanic.split(',').map(d => d.trim()),
    categories:  data.category.split(',').map(d => d.trim()),
  }
}

//Setup
function setup(){
  chartDiv = d3.select('#charts');
  tooltipDiv = d3.select('#tooltip');
  
  d3.csv(dataURL, rowConverter).then(processData);
}

window.onload = setup;