'use strict';

let dataURL = 'board-game-data.csv';
var dataset = {};
var categoryData = {};
var mechanicData = {};

// Dimensions used by all charts
let width = 600;
let height = 850;
let xPadding = 10;
let yInnerPadding = 0.1;
let yOuterPadding = 0.1;

let color = 'grey';

//Charting functions
function createBarChart(data,key,getX,getY){
  console.log('Create bar chart...');
  
  //Create scales
  let xMax = d3.max(data,getX);
  let xScale = d3.scaleLinear()
    .domain([0,xMax])
    .rangeRound([0,width-(xPadding)]);
  
  let yMax = d3.max(data,getY)
  let yScale = d3.scaleBand()
    .domain(data.map(getY))
    .rangeRound([0,height])
    .paddingInner(yInnerPadding)
    .paddingOuter(yOuterPadding);
  
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
}

function createCategoryChart(data){
  console.log('Create category');
  console.dir(data);
  
  let getCat = (d) => d.category;
  let getCount = (d) => d.count;
  createBarChart(data,getCat,getCount,getCat);
}

function createMechanicsChart(data){
  
}

function createPlayersChart(data){
  
}

function createPlaytimeChart(data){
  
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

function getCategories(data){
  return getArrayValuesCount(data,(d) => d.categories).map((entry) => {
    return {
      category: entry[0],
      count: entry[1]
    }
  });
}

function getMechanics(data){
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
  
  categoryData = getCategories(data);
  mechanicData = getMechanics(data);
  
  createCategoryChart(categoryData);
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