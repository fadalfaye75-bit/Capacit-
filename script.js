// 🔗 Fichiers CSV locaux
const SHEET_GARCONS = "garcons.csv";
const SHEET_FILLES  = "filles.csv";

// Formules modifiables
let formuleGarcons = localStorage.getItem("formuleGarcons") || "Math.max(0, 2 - litsNonOccupes)";
let formuleFilles  = localStorage.getItem("formuleFilles")  || "Math.max(0, 3 - litsNonOccupes)";

// Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.style.display = "block";
  setTimeout(()=> toast.style.display = "none", 3000);
}

// CSV → JSON
async function importSheetLocal(fileName) {
  const response = await fetch(fileName);
  const csv = await response.text();
  const lines = csv.split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const obj = {};
    line.split(",").forEach((val, i) => obj[headers[i]] = val.trim());
    return obj;
  });
}

// Affichage tableau
function displayData(data) {
  const tbody = document.querySelector("#tableChambres tbody");
  tbody.innerHTML = "";

  data.forEach(item => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.Nom_de_la_chambre || ""}</td>
      <td>${item.Nombre_de_personnes_présents || 0}</td>
      <td>${item.Nombre_de_personnes_hébergées || 0}</td>
      <td>${item.Nombre_de_lits_non_occupés || 0}</td>
      <td>${item.Nombre_de_matelas_dèjà_présents || 0}</td>
      <td></td>
      <td></td>
      <td>${item.Sexe || ""}</td>
    `;
    tbody.appendChild(row);
  });

  showToast("✅ Données importées !");
}

// Bouton importer
document.getElementById("importer").addEventListener("click", async () => {
  const garcons = await importSheetLocal(SHEET_GARCONS);
  const filles  = await importSheetLocal(SHEET_FILLES);
  const all = [...garcons, ...filles];
  displayData(all);
});

// Calculer formules
document.getElementById("calculer").addEventListener("click", () => {
  const rows = document.querySelectorAll("#tableChambres tbody tr");

  rows.forEach(tr => {
    let litsNonOccupes = parseInt(tr.children[3].innerText);
    let sexe = tr.children[7].innerText.toLowerCase();

    let calcul = sexe.includes("garçon")
      ? eval(formuleGarcons)
      : eval(formuleFilles);

    tr.children[5].innerText = calcul;
    tr.children[6].innerText = calcul + litsNonOccupes;
  });

  showToast("✅ Calcul effectué !");
});

// Connexion admin
document.getElementById("loginAdmin").addEventListener("click", () => {
  const mdp = prompt("Mot de passe :");
  if (mdp === "NOYAU DIOGS") {
    document.getElementById("adminPanel").style.display = "block";
    showToast("✅ Mode Admin Activé");
  } else showToast("❌ Mot de passe incorrect");
});

// Sauvegarder formules
document.getElementById("saveFormulas").addEventListener("click", () => {
  formuleGarcons = document.getElementById("formulaGarcons").value;
  formuleFilles  = document.getElementById("formulaFilles").value;

  localStorage.setItem("formuleGarcons", formuleGarcons);
  localStorage.setItem("formuleFilles", formuleFilles);

  showToast("✅ Formules sauvegardées !");
});

// Export Excel
document.getElementById("exportExcel").addEventListener("click", () => {
  let table = document.getElementById("tableChambres");
  let wb = XLSX.utils.table_to_book(table, {sheet:"Chambres"});
  XLSX.writeFile(wb, "Gestion_Chambres.xlsx");
  showToast("✅ Tableau exporté en Excel !");
});
