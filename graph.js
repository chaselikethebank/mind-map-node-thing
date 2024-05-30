const width = 1000;
const height = 600;

const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [-width / 2, -height / 2, width, height])
  .attr("style", "margin: 0 auto; display: block; background: #1e1e1e;");

// Simulation with forces
const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id))
  .force("charge", d3.forceManyBody().strength(-600))
  .force("center", d3.forceCenter(0, 0));

  const graph = {
    nodes: [
      { id: "Label", level: 1 },
      { id: "Marketing", level: 2 },
      { id: "Sales", level: 2 },
      { id: "Operation", level: 2 },
      { id: "Finance", level: 2 },
      { id: "Product", level: 2 },
      { id: "Paid Media", level: 3 },
      { id: "Earned Media", level: 3 },
      { id: "Email Marketing", level: 3 },
      { id: "Physical Product", level: 3 },
      { id: "Digital Products", level: 3 },
      { id: "Live", level: 3 },
      { id: "Distribution", level: 3 },
      { id: "Production", level: 3 },
      { id: "Sync", level: 3 },
      { id: "Tax Harvest", level: 3 },
      { id: "Profitable", level: 3 },
      { id: "Gain Market Share", level: 4 },




    ],
    links: [
      { source: "Label", target: "Marketing" },
      { source: "Label", target: "Sales" },
      { source: "Label", target: "Operation" },
      { source: "Label", target: "Finance" },
      { source: "Label", target: "Product" },
      { source: "Marketing", target: "Paid Media" },
      { source: "Marketing", target: "Earned Media" },
      { source: "Marketing", target: "Email Marketing" },
      { source: "Sales", target: "Physical Product" },
      { source: "Sales", target: "Digital Products" },
      { source: "Sales", target: "Live" },
      { source: "Operation", target: "Distribution" },
      { source: "Operation", target: "Production" },
      { source: "Operation", target: "Sync" },
      { source: "Finance", target: "Tax Harvest" },
      { source: "Finance", target: "Profitable" },
      { source: "Tax Harvest", target: "Gain Market Share" }




    ]
  };
  

const link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(graph.links)
  .enter().append("line")
  .attr("class", "link");

const node = svg.append("g")
  .attr("class", "nodes")
  .selectAll("circle")
  .data(graph.nodes)
  .enter().append("circle")
  .attr("class", "node")
  .attr("r", d => 20 / d.level)
  .call(drag(simulation));

const label = svg.append("g")
  .attr("class", "labels")
  .selectAll("text")
  .data(graph.nodes)
  .enter().append("text")
  .attr("class", "label")
  .attr("dy", -10)
  .text(d => d.id);

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;

    const draggedNode = event.subject;
    const closestNode = findClosestNode(draggedNode);

    if (closestNode) {
      // Determine if new link is parent or child based on x position
      if (draggedNode.x < closestNode.x) {
        // draggedNode becomes parent
        updateLinks(draggedNode.id, closestNode.id);
      } else {
        // draggedNode becomes child
        updateLinks(closestNode.id, draggedNode.id);
      }
    }
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

function findClosestNode(draggedNode) {
  const threshold = 50; // Distance threshold to consider a node as a potential new link
  let closestNode = null;
  let minDistance = Infinity;

  graph.nodes.forEach(node => {
    if (node.id !== draggedNode.id) {
      const distance = Math.hypot(draggedNode.x - node.x, draggedNode.y - node.y);
      if (distance < minDistance && distance < threshold) {
        minDistance = distance;
        closestNode = node;
      }
    }
  });

  return closestNode;
}

function updateLinks(newParentId, newChildId) {
  // Remove existing links for the new child
  graph.links = graph.links.filter(link => link.target.id !== newChildId);

  // Add new link
  graph.links.push({ source: newParentId, target: newChildId });

  // Update levels
  const newParent = graph.nodes.find(node => node.id === newParentId);
  const newChild = graph.nodes.find(node => node.id === newChildId);
  newChild.level = newParent.level + 1;

  // Update the graph
  updateGraph();
}

function addNode() {
  const newNode = document.getElementById("newNode").value;
  const parentNode = document.getElementById("parentNode").value;
  
  if (newNode && parentNode) {
    const parent = graph.nodes.find(n => n.id === parentNode);
    if (parent) {
      const newLevel = parent.level + 1;
      graph.nodes.push({ id: newNode, level: newLevel });
      graph.links.push({ source: parentNode, target: newNode });

      updateGraph();
    } else {
      alert("Parent node not found");
    }
  } else {
    alert("Please enter both node names");
  }
}

function updateGraph() {
  // Update links
  link.data(graph.links)
    .join(
      enter => enter.append("line").attr("class", "link"),
      update => update,
      exit => exit.remove()
    );

  // Update nodes
  const newNodeSelection = node.data(graph.nodes)
    .join(
      enter => enter.append("circle")
        .attr("class", "node")
        .attr("r", d => 20 / d.level)
        .call(drag(simulation)),
      update => update,
      exit => exit.remove()
    );

  // Update labels
  label.data(graph.nodes)
    .join(
      enter => enter.append("text")
        .attr("class", "label")
        .attr("dy", -10)
        .text(d => d.id),
      update => update,
      exit => exit.remove()
    );

  simulation.nodes(graph.nodes);
  simulation.force("link").links(graph.links);
  simulation.alpha(1).restart();
}

simulation
  .nodes(graph.nodes)
  .on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });

simulation.force("link")
  .links(graph.links);
