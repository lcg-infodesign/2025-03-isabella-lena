// dati CSV
let data; 
let minLat, minLon, maxLat, maxLon; 
let margin = 90;
// dimensioni del grafico
let chartW, chartH; 

function preload() {
  data = loadTable("data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");

  let allLat = [];
  let allLon = [];

  // ciclo per prendere tutte le coordinate valide di latitudine e longitudine
  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));

    if (!isNaN(lat) && !isNaN(lon)) {
      allLat.push(lat);
      allLon.push(lon);
    }
  }

  minLat = min(allLat);
  maxLat = max(allLat);
  minLon = min(allLon);
  maxLon = max(allLon);

  // dimensioni del grafico
  chartW = width * 0.8;
  chartH = height * 0.9;
}

function draw() {
  background(90);

  // titolo
  fill("white");
  textSize(25);
  textAlign(CENTER);
  text("VULCANI", width/2, margin - 5 - 12); 

  // vulcano più vicino al cursore
  let closestDist = Infinity; 
  let closestRow = null;
  let closestX, closestY;
  let closestRadius = null;
  let closestCategory = null;

  // ciclo per disegnare ogni vulcano
  for (let i = 0; i < data.getRowCount(); i++) {
    // trovo tutti i valori minimi e massimi validi
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));
    let elev = parseFloat(data.getString(i, "Elevation (m)"));

    // salto i dati non validi
    if (isNaN(lat) || isNaN(lon)) continue;

    // converto la Longitudine (lon) in x e la Latitudine (lat) in y
    let x = map(lon, minLon, maxLon, margin, chartW - margin);
    let y = map(lat, minLat, maxLat, chartH - margin, margin); 
    //inverto la y (chartH - margin, margin) così il nord  sta in alto


    let status = data.getString(i, "Status");
    let radius; 

    // assegno un raggio diverso in base allo stato
    switch (status) {
      case "Historical":
        radius = 10; 
        break;
      case "Holocene":
        radius = 5; 
        break;
      case "Fumarolic":
      case "Hydrophonic":
      case "Unknown":
      default:
        radius = 3; 
    }

    // valore da 0 a 1 per determinare il colore dell'altitudine
    let t = map(elev, -6000, 7000, 0, 1);
    // creo un gradiente di colore
    let col = lerpColor(color('yellow'), color('red'), constrain(t, 0, 1));

    // leggo la categoria del vulcano
    let category = data.getString(i, "TypeCategory");
    // imposto il colore del vulcano
    fill(col);
    noStroke(); 

    switch (category) {
      case "Stratovolcano": 
        drawCircle(x, y, radius); 
        break;
      case "Shield Volcano": 
        drawSquare(x, y, radius); 
        break;
      case "Submarine Volcano": 
        drawTriangle(x, y, radius); 
        break;
      case "Cone":
      drawCross(x, y, radius);
      break;
      default: 
        drawStar(x, y, radius);
        break;
    }

    // distanza mouse - vulcano
    let d = dist(x, y, mouseX, mouseY);

    // memorizza il più vicino
    if (d < radius) {
      if (d < closestDist) { // se c'è un pallino sotto confronta con la distanza dal mouse
        closestDist = d; // se è più piccolo mostra le sue info
        closestRow = i;
        closestX = x;
        closestY = y;
        closestRadius = radius;
        closestCategory = category;
      }
    }
  }
  // hover vulcano
  if (closestRow !== null) {
    // evidenzia il pallino in bianco
    fill("white");
    noStroke(); 
    // uso la categoria salvata per decidere cosa disegnare
    switch (closestCategory) {
      case "Stratovolcano": 
      drawCircle(closestX, closestY, closestRadius); 
      break;
      case "Shield Volcano": 
      drawSquare(closestX, closestY, closestRadius); 
      break;
      case "Submarine Volcano": 
      drawTriangle(closestX, closestY, closestRadius); 
      break;
      case "Cone": 
        drawCross(closestX, closestY, closestRadius);
        break;
      default: 
        drawStar(closestX, closestY, closestRadius);
        break;
    }

    // definisco l'area per le info
    let infoX = chartW + 90;
    let infoY = margin; 
    // calcola la larghezza massima disponibile per il testo
    let infoWidth = width - infoX - 20; // (width - startX - margineDx)

    // recupero tutti i dati
    let name = data.getString(closestRow, "Volcano Name");
    let country = data.getString(closestRow, "Country");
    let typeCat = data.getString(closestRow, "TypeCategory");
    let elev = data.getString(closestRow, "Elevation (m)");
    let status = data.getString(closestRow, "Status");

    let infoString = "";
    infoString += name + " (" + country + ")\n\n"; 
    // \n\n = lascia una riga vuota
    infoString += "Category: " + typeCat + "\n";
    infoString += "Elevation: " + elev + " m\n";
    infoString += "Status: " + status + "\n";

    // disegno il testo
    fill("white");
    textSize(20);
    textAlign(LEFT, TOP); 
    
    // disegno la stringa unica
    text(infoString, infoX, infoY, infoWidth);
    
    // rimetto a posto l'allineamento per il resto dello sketch
    textAlign(LEFT); 

  }

  drawLegend(); // legenda
}

function drawLegend() {
  let legendX = margin; // inizia dal margine sinistro
  let legendY = chartH; // la posiziono sotto l'area del grafico

  textAlign(LEFT, TOP);
  fill("white");
  textSize(15);
  text("Elevazione", legendX, legendY);

  let gradH = 30; // Altezza della barra
  // la larghezza corrisponde a quella del grafico
  let gradW = chartW - margin * 1.5; 

  noStroke();
  for (let i = 0; i <= gradW; i++) {
    // calcola il colore in base alla posizione 
    let inter = i / gradW;

    let c = lerpColor(color('yellow'), color('red'), inter);
    
    stroke(c);
    line(legendX + i, legendY + 20, legendX + i, legendY + 20 + gradH);
  }

  // etichette legenda
  noStroke();
  fill("white");
  textSize(12);
  
  // etichetta Sinistra
  textAlign(LEFT, TOP);
  text("-6000 m", legendX, legendY + 25 + gradH);
  
  // etichetta Destra
  textAlign(RIGHT, TOP);
  text("+7000 m", legendX + gradW, legendY + 25 + gradH);
  
  // reset
  textAlign(LEFT);

  // imposta la posizione di partenza per la nuova legenda
  let sizeLegendX = chartW;
  let sizeLegendY = chartH - 30; 

  // titolo per la nuova legenda
  fill("white");
  textSize(15);
  textAlign(LEFT, TOP);
  text("Livello attività", sizeLegendX, sizeLegendY);

  // spaziatura
  let yPos = sizeLegendY + 35;
  let xPos = sizeLegendX + 10; // Un po' di margine
  let textXPos = xPos + 25;   // Dove inizia il testo

  // 1. cerchio grande
  let rLarge = 10; 
  fill("white");
  noStroke();
  ellipse(xPos, yPos, rLarge * 2);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("Historical", textXPos, yPos);

  // 2. cerchio "Holocene" medio
  let rMedium = 5; 
  yPos += 25; // sposto in basso
  ellipse(xPos, yPos, rMedium * 2);
  text("Holocene", textXPos, yPos);

  // 3. cerchio piccolo
  let rSmall = 3; 
  yPos += 25; 
  ellipse(xPos, yPos, rSmall * 2);
  text("Other / Unknown", textXPos, yPos);

  // reset
  textAlign(LEFT);

  
  let shapeLegendX = chartW; 
  let shapeLegendY = chartH- 190; 

  fill("white");
  textSize(14);
  textAlign(LEFT, TOP);
  text("Categoria di Vulcano", shapeLegendX, shapeLegendY);

  let shapeYPos = shapeLegendY + 35;
  let shapeXPos = shapeLegendX + 10;
  let shapeTextXPos = shapeXPos + 25;
  let sampleRadius = 5; // raggio fisso per gli esempi nella legenda

  // stratovolcano 
  fill("white");
  noStroke();
  drawCircle(shapeXPos, shapeYPos, sampleRadius);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("Stratovolcano", shapeTextXPos, shapeYPos);

  // shield volcano 
  shapeYPos += 25;
  drawSquare(shapeXPos, shapeYPos, sampleRadius);
  text("Shield Volcano", shapeTextXPos, shapeYPos);

  // submarine volcano 
  shapeYPos += 25;
  drawTriangle(shapeXPos, shapeYPos, sampleRadius);
  text("Submarine Volcano", shapeTextXPos, shapeYPos);

  // cone 
  shapeYPos += 25;
  fill("white");
  noStroke(); 
  drawCross(shapeXPos, shapeYPos, sampleRadius);
  textAlign(LEFT, CENTER);
  text("Cone", shapeTextXPos, shapeYPos);

  // altri
  shapeYPos += 25;
  fill("white"); 
  noStroke();
  drawStar(shapeXPos, shapeYPos, sampleRadius);
  text("Altri", shapeTextXPos, shapeYPos);

  textAlign(LEFT); 
}

// cerchio 
function drawCircle(x, y, radius) {
  ellipse(x, y, radius * 2);
}

// quadrato
function drawSquare(x, y, radius) {
  rectMode(CENTER); // disegna il rettangolo dal centro
  rect(x, y, radius * 2, radius * 2);
}

// triangolo 
function drawTriangle(x, y, radius) {
  let h = radius * sqrt(3); // altezza del triangolo equilatero
  triangle(x, y - h / 2, x - radius, y + h / 2, x + radius, y + h / 2);
}

// croce 
function drawCross(x, y, radius) {
  let thickness = radius / 2; // spessore della croce
  rectMode(CENTER);
  // rettangolo verticale
  rect(x, y, thickness, radius * 2);
  // rettangolo orizzontale
  rect(x, y, radius * 2, thickness);
}

// stella a 5 punte
function drawStar(x, y, radius) {
  let angle = TWO_PI / 5; // l'angolo tra i punti esterni
  let halfAngle = angle / 2.0;
  
  beginShape();
  for (let a = -PI / 2; a < TWO_PI - PI / 2; a += angle) {
    // vertice esterno
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
    
    // vertice interno 
    let sx_inner = x + cos(a + halfAngle) * (radius / 2.5);
    let sy_inner = y + sin(a + halfAngle) * (radius / 2.5);
    vertex(sx_inner, sy_inner);
  }
  endShape(CLOSE);
}

// cambia font