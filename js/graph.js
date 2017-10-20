// /js/graph.js

// Canvas.
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Shadow
ctx.shadowOffsetX = 15;
ctx.shadowOffsetY = 15;
ctx.shadowBlur = 14;
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

// Vertex construction.
var Vertex = function(x, y, radius, value, oldValue) {
  this.value = value;
  this.oldValue = oldValue;
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = 'grey'
  this.movable = false;
  // Draw vertex.
  this.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.strokeStyle = '#000000';
    ctx.strokeText(this.oldValue,this.x + 10, this.y - 10);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Edge construction.
var Edge = function(start, end, color) {
  this.start = start;
  this.end = end;
  this.color = color;
  // Draw edge with no direction.
  this.draw = function() {
    this.sin = Math.sin(Math.atan((end.y - start.y) / (end.x - start.x)));
    this.cos = Math.cos(Math.atan((end.y - start.y) / (end.x - start.x)));
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  // Draw edge with arrow.
  this.drawWithArrow = function() {
    this.sin = Math.sin(Math.atan((end.y - start.y) / (end.x - start.x)));
    this.cos = Math.cos(Math.atan((end.y - start.y) / (end.x - start.x)));
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    var endRadians=Math.atan((end.y - start.y) / (end.x - start.x));
    endRadians+=((end.x >= start.x) ? 90 : -90) * Math.PI / 180;
    ctx.save();
    ctx.beginPath();
    ctx.translate(end.x,end.y);
    ctx.rotate(endRadians);
    ctx.moveTo(0,0);
    ctx.lineTo(3,15);
    ctx.lineTo(-3,15);
    ctx.closePath();
    ctx.restore();
    ctx.stroke();
  }
}

/**
 * Transfer the cyclic permutation expression to another expression that can be easily 
 * operated by the program.
 * @param {Array} arr A set that generates the symmetric group. 
 * @param {string} str The cyclic permutation.
 */
function transfer (arr, str) {
  var result = '';
  var _str = str.split('|');
  var i = 0, j = 0;
  for(; i < arr.length; i++) {
    if(i < str.length) {
      if(arr.indexOf(str[i]) === -1) {
        result = '';
        break;
      }
    }
    if(str.search(arr[i]) === -1){
      result += arr[i];
      continue;
    }
    for(; j < _str.length; j++){
      if(_str[j].search(arr[i]) != -1) {
        break;
      }
    }
    if(_str[j].search(arr[i]) === _str[j].length-1) {
      result +=_str[j].charAt(0);
      continue;
    }
    result += _str[j].charAt(_str[j].search(arr[i]) + 1);
  }
  return result;
}

/**
 * Oposite to the transfer();
 * @param {Array} _arr A set that generates the symmetric group.
 * @param {string} str The expression that can be easily operated by the program.
 */
function reverse (_arr, str) {
  // A copy of _arr.
  var arr = _arr.slice(0);
  if(arr.join('') === str) {
    return 1;
  }
  var result = '';
  var i = 0;
  var p = '', q = '';
  var unFound = true;
  while(arr.length > 0) {
    i = 0;
    if(arr[i] === str[i]) {
        str = str.replace(str[i], '');
        arr.splice(i, 1);
        continue;
    }else if(unFound === false) {
      result += '|';
    }
    p = arr[0];
    unFound = true;
    while(unFound){
      result += arr[i];
      if((q = str[arr.indexOf(str[i])]) === p){
        result += str[i];
        unFound = false;
      }
      str = str.replace(str[i], '');
      arr.splice(i, 1);
      i = str.search(q);
      if(unFound === false) {
        str = str.replace(str[i], '');
        arr.splice(i, 1);
      }
    }
  }
  return result;
}

/**
 * Operation of the symmetric group.
 * @param {Array} arr A set that generates the symmetric group.
 * @param {string} l Expression on the left side.
 * @param {string} r Expression on the right side.
 */
function opt(arr, l, r) {
  var _l = '';
  var result = '';
  for(i = 0; i <l.length; i++) {
    _l += arr[l.search(arr[i])];
  }
  for(i = 0; i < l.length; i++) {
    result += _l.charAt(arr.indexOf(r.charAt(i)));
  }
  return result;
}


/**
 * To get a symetric group by providng a string.
 * AKA to get all the arranges of a string. 
 * ... From the internet.
 * @param {string} o 
 */
function charsMap(o){
  // Remove space and duplicate characters.
  o = (o+"").replace(/(\w)(?=\w*\1)/g,"").replace(/\s+/g,"");
  switch(o.length){
    case 0:
    case 1: return [o];
    default:
      // Reg = slice 'abcd' to 'abc' & 'd'.
      var p = /^(\S+?)(\S)$/.exec(o),
          _r = charsMap(p[1]),
          l = p[2],
          r = [];
      for (var i = 0; i < _r.length; i++) {
          var t = _r[i];
          for (var j = 0, len = t.length; j <= len; j++) {
              //Reg = Array.splice(j,0,l).
              r.push( t.replace( new RegExp("^(\\S{"+j+"})(\\S{"+(len-j)+"})$"), "$1"+l+"$2" ) );
          }
      }
      return r;
  }
}

// Clear the canvas.
function clear() {
  // Setting background color.
  ctx.fillStyle = '#eee';
  ctx.fillRect(0,0,canvas.width/(Math.pow(muFactor.value, muFactor.n)),canvas.height/(Math.pow(muFactor.value, muFactor.n)));
  // Without backgound color.
  //ctx.clearRect(0,0,canvas.width/(Math.pow(muFactor.value, muFactor.n)),canvas.height/(Math.pow(muFactor.value, muFactor.n)));
}

// Original point of canvas.
var O = {
  x: window.innerWidth/2,
  y: window.innerHeight/2
}

// Array of vertexes and Array of edges.
var vertexes = [];
var edges = [];

// Get random color.
var getRandomColor = function(){    
  return (function(m,s,c){    
    return (c ? arguments.callee(m,s,c-1) : '#') +    
      s[m.floor(m.random() * 16)]    
  })(Math,'0123456789abcdef',5)
};

// Draw the initial graph.
function run(set, group, subGroup) {
  // Initial scale of graph.
  var r = document.getElementById('scale').value;

  clear();
  vertexes = [];
  edges = [];
  var checkResult = true;
  const _set = set.split(',');
  var _group = [];
  var __group = [];
  const __subGroup = subGroup.split(',');
  const _subGroup = __subGroup.map((x) => {
    return transfer(_set, x);
  });
  // Different treatment according to the type of group, which maps data 
  // submited by the 'submit' button or 'surprise' button.
  if(typeof group === 'string'){
    _group = group.split(',').map((x) => {
      return transfer(_set, x);
    });
    __group = group.split(',');
    // Input is valid or not;
    var symGroup = charsMap(set.replace(/,/g ,''));
    for(var k = 0; k < _group.length; k++ ) {
      if(symGroup.indexOf(_group[k]) === -1) {
        checkResult = false;
        break;
      }
      if(k < _subGroup.length) {
        if(symGroup.indexOf(_subGroup[k]) === -1) {
          checkResult = false;
          break;
        }
      }
    }
  } else {
    _group = group;
    __group = group.map((x) => {
      return reverse(_set, x);
    });
    document.getElementById('group').value = __group;
    
    // Input is valid or not;
    var symGroup = group;
    for(var k = 0; k < _subGroup.length; k++ ) {
      if(symGroup.indexOf(_subGroup[k]) === -1) {
        checkResult = false;
        break;
      }
    }

  }

  // Check result according to dependency of inputs.
  console.log(checkResult);
  if(!checkResult) {
    alert('Wrong input.');
    return 0;
  }
  // Count of vertexes.
  var Count = _group.length;
  // Polygon interior angle.
  var InteriorAngle = 2*Math.PI/Count;
  // Color array of edges.
  var palette = [];
  // Fill the color array.
  for(var i = 0; i < __group.length; i++) {
    palette.push(getRandomColor());
  }
  // Draw vertexes.
  for(var l = 0; l < Count; l++) {
    vertexes.push(new Vertex(O.x + r*Math.sin(l*InteriorAngle), O.y - r*Math.cos(l*InteriorAngle), 9, _group[l], __group[l]));
    vertexes[l].draw();
  }

  unselectedVertexes = vertexes.slice(0);
  var v = 0;
  var newLength = 0;
  // Draw edges.
  for(var m = 0; m < Count; m++) {
    for(var n = m + 1; n < Count; n++) {
      if((v = _subGroup.indexOf(opt(_set, _group[m], _group[n]))) !== -1){
        newLength = edges.push(new Edge(vertexes[m],vertexes[n],palette[v]));
        edges[newLength-1].drawWithArrow();
      }
      if((v = _subGroup.indexOf(opt(_set, _group[n], _group[m]))) !== -1){
        newLength = edges.push(new Edge(vertexes[n],vertexes[m],palette[v]));
        edges[newLength-1].drawWithArrow();
      }
    }
  }
  // Palette
  document.getElementById('palette').innerHTML = '';
  for(var j = 0; j < __subGroup.length; j++) {
    var div = document.createElement('div');
    var span = document.createElement('span');
    var innerDiv = document.createElement('div');
    div.className = 'label';
    span.innerText = __subGroup[j];
    innerDiv.style.backgroundColor = palette[j];
    div.appendChild(span);
    div.appendChild(innerDiv);
    document.getElementById('palette').appendChild(div);
  }
}


// Submit button oncick event binding.
document.getElementById('submit').addEventListener('click',function() {
  var set = document.getElementById('set').value;
  var group = document.getElementById('group').value;
  var subGroup = document.getElementById('subGroup').value;
  // Null input check.
  if(set === '' || group === '' || subGroup === '') {
    alert('Null input.');
  }else {
    run(set, group, subGroup);
  }

},false);

// Surprise button onclick event binding.
document.getElementById('surprise').addEventListener('click', function() {
  var set = document.getElementById('set').value;
  var group = charsMap(set.replace(/,/g ,''));
  var subGroup = document.getElementById('subGroup').value;
  // Null input check.
  if(set === '' || subGroup === '') {
    alert('Null input.');
  }else {
    run(set, group, subGroup);
  }
},false);

// Selected vertex and Array of unselected vertexes.
var selectedVertex = null;
var unselectedVertexes = [];
var copyOfVertexes = [];
// Anchor.
var shift = {
  x: 0,
  y: 0,
  movable: false
}
// Amplification coefficient.
var muFactor = {
  value: 1.05,
  n: 0,
  multiplicative: 1
}

// Handle mousedown event. 
canvas.addEventListener('mousedown', function(event) {
  const {clientX, clientY} = event;
  copyOfVertexes = [];
  for(var i = 0; i < vertexes.length; i++){
    if(Math.sqrt(Math.pow(clientX - vertexes[i].x*(Math.pow(muFactor.value, muFactor.n)), 2) + Math.pow(clientY - vertexes[i].y*(Math.pow(muFactor.value, muFactor.n)), 2)) < vertexes[i].radius * 1.5*(Math.pow(muFactor.value, muFactor.n))){
      vertexes[i].movable = true;
      selectedVertex = vertexes[i];
      unselectedVertexes.splice(i,1);
      break;
    }
    copyOfVertexes.push({x: vertexes[i].x, y: vertexes[i].y});
    if(i === vertexes.length - 1){
      shift = {x: clientX, y: clientY, movable: true};
    }
  }
}, false);
// Handle mousemove event.
canvas.addEventListener('mousemove', function(event) {
  const clientX = event.clientX/Math.pow(muFactor.value, muFactor.n);
  const clientY = event.clientY/Math.pow(muFactor.value, muFactor.n);
  if (selectedVertex !== null && selectedVertex.movable) {
    clear();
    selectedVertex.x = clientX;
    selectedVertex.y = clientY;
    selectedVertex.draw();
    for(var j = 0; j < unselectedVertexes.length; j++) {
      unselectedVertexes[j].draw();
    }
    for(var k = 0; k < edges.length; k++) {
      edges[k].drawWithArrow();
    }
  }
  if(shift.movable) {
    clear();
    var deltaX = (clientX - shift.x/Math.pow(muFactor.value, muFactor.n));
    var deltaY = (clientY - shift.y/Math.pow(muFactor.value, muFactor.n));
    for(var j = 0; j < unselectedVertexes.length; j++) {
      unselectedVertexes[j].x = copyOfVertexes[j].x;
      unselectedVertexes[j].x += deltaX;
      unselectedVertexes[j].y = copyOfVertexes[j].y;
      unselectedVertexes[j].y += deltaY;
      unselectedVertexes[j].draw();
    }
    for(var k = 0; k < edges.length; k++) {
      edges[k].drawWithArrow();
    }
  }
}, false);

// Handle mouseup event.
canvas.addEventListener('mouseup', function(event) {
  if(selectedVertex !== null){
    selectedVertex.movable = false;
    selectedVertex = null;
    unselectedVertexes = vertexes.slice(0);
  }
  shift.movable = false;
}, false);


// Handle mouseWheel event.
canvas.addEventListener('mousewheel', function(event) {
  clear();
  if(event.deltaY < 0){
    ctx.transform(muFactor.value,0,0,muFactor.value,0,0);
    muFactor.n += 1;
    for(var j = 0; j < unselectedVertexes.length; j++) {
      unselectedVertexes[j].draw();
    }
    for(var k = 0; k < edges.length; k++) {
      edges[k].drawWithArrow();
    }
  }else {
    ctx.transform(1/muFactor.value,0,0,1/muFactor.value,0,0);
    muFactor.n -= 1;
    for(var j = 0; j < unselectedVertexes.length; j++) {
      unselectedVertexes[j].draw();
    }
    for(var k = 0; k < edges.length; k++) {
      edges[k].drawWithArrow();
    }
  }
}, false);

// Help button onclick event binding.
var visible = false;
var help = document.querySelector('.help');
document.querySelector('#help').addEventListener('click', function() {
  if(visible){
    help.style.display = 'none';
    visible = !visible;
  }else{
    help.style.display = 'block';
    visible = !visible;
  }
}, false);

//Initialize backgroud color.
clear();