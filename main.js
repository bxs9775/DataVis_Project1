'use strict';

let dataURL = 'board-game-data.csv';
var dataset = {};
var categoryData = {};
var mechanicData = {};

// Dimensions used by all charts
let width = 1000;
let height = 850;
let xPadding = 200;
let yInnerPadding = 0.1;
let yBottomPadding = 18;
let xAxisOff = yBottomPadding;
let yAxisOff = xPadding;
let spanXAdjust = xPadding;

let color = 'grey';

//data getting functions
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

//Charting functions
function createYScale(data,getY){
  let yMax = d3.max(data,getY)
  let yScale = d3.scaleBand()
    .domain(data.map(getY))
    .rangeRound([0,height-yBottomPadding])
    .paddingInner(yInnerPadding);
  return yScale;
}

function createAxes(chart,xScale,yScale,xAdjust=0){
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);
  
  chart.append('g')
    .attr('class', 'xaxis axis')
    .attr('transform', `translate(${yAxisOff-xAdjust},${height-xAxisOff})`)
    .call(xAxis);
  
  chart.append('g')
    .attr('class', 'yaxis axis')
    .attr('transform', `translate(${yAxisOff},0 )`)
    .call(yAxis);
}

function createBarChart(data,key,getX,getY){
  console.log('Create bar chart...');
  
  //Create scales
  let xMax = d3.max(data,getX);
  let xScale = d3.scaleLinear()
    .domain([0,xMax])
    .rangeRound([0,width-(xPadding)]);
  
  let yScale = createYScale(data,getY);
  
  //Create svg chart
  let chart = d3.select('#charts').append('svg')
    .attr('width',width)
    .attr('height',height);
  
  chart.selectAll('rect')
    .data(data,key)
    .enter()
    .append('rect')
    .attr('x',xPadding)
    .attr('y',(d) => yScale(getY(d)))
    .attr('width',(d) => xScale(getX(d)))
    .attr('height',yScale.bandwidth())
    .attr('fill',color);
  
  //Axis
  createAxes(chart,xScale,yScale);
}

function createSpanChart(data,key,getMinX,getMaxX,getY){
  console.log('Create span chart...');
  
  //Create scales
  let xMax = d3.max(data,getMaxX);
  let xScale = d3.scaleLinear()
    .domain([0,xMax])
    .rangeRound([xPadding,width]);
  
  let yScale = createYScale(data,getY);
  
  //Create svg chart
  let chart = d3.select('#charts').append('svg')
    .attr('width',width)
    .attr('height',height);
  
  chart.selectAll('rect')
    .data(data,key)
    .enter()
    .append('rect')
    .attr('x',(d) => xScale(getMinX(d)))
    .attr('y',(d) => yScale(getY(d)))
    .attr('width',(d) => xScale(getMaxX(d))-xScale(getMinX(d)))
    .attr('height',yScale.bandwidth())
    .attr('fill',color);
  
  //Axis
  createAxes(chart,xScale,yScale,spanXAdjust);
}

function createCategoryChart(data=categoryData){
  //console.log('Create category chart');
  //console.dir(data);
  
  data.sort(sortCount);
  
  createBarChart(data,getCategory,getCount,getCategory);
}

function createMechanicsChart(data=mechanicData){
  //console.log('Create mechanics chart');
  //console.dir(data);
  
  data.sort(sortCount);
  
  createBarChart(data,getMechanic,getCount,getMechanic);
}

function createPlayersChart(data=dataset){
  //console.log('Create players chart');
  //console.dir(data);
  
  data.sort(sortRank);
  
  createSpanChart(data,getId,getMinPlayers,getMaxPlayers,getName);
}

function createPlaytimeChart(data=dataset){
  //console.log('Create playtime chart');
  //console.dir(data);
  
  data.sort(sortRank);
  
  createSpanChart(data,getId,getMinPlaytime,getMaxPlaytime,getName);
}

function changeChart(){
  let chartType = d3.select(this).node().value;
  console.log(`Switching charts - new chart = ${chartType}`);
  
  d3.select('#charts').selectAll('svg').remove();
  
  switch(chartType){
    case 'category':
      createCategoryChart();
      break;
    case 'mechanics':
      createMechanicsChart();
      break;
    case 'numPlayers':
      createPlayersChart();
      break;
    case 'playTime':
      createPlaytimeChart();
      break;
  }
}

//Helper functions

function getArrayValuesCount(data, getArray){
  let counts = {};
  
  let values = data.map(getArray).flat();
  
  //console.dir(values);
  
  //unique values counting solution from https://stackoverflow.com/questions/12749200/how-to-count-array-elements-by-each-element-in-javascript
  for(var i = 0; i < values.length; i++){
    counts[values[i]] = (counts[values[i]]+1) || 1;
  }
  //console.dir(counts);
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
  console.log('Processing data');
  console.dir(data);
  dataset = data;
  
  categoryData = getCategoriesArray(data);
  mechanicData = getMechanicsArray(data);
  
  createCategoryChart();
  console.log('Setting up chart switching event...');
  d3.select('#dataViews').on('change',changeChart);
}

function rowConverter(data){
  console.log('Converting data');
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
  console.log('Setup');
  d3.csv(dataURL, rowConverter).then(processData);
}

window.onload = setup;