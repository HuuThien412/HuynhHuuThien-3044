const API = "https://api.escuelajs.co/api/v1/products";

let allData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 5;

// ===== LOAD DATA =====
async function loadData() {
    const res = await fetch(API);
    allData = await res.json();
    filteredData = [...allData];
    renderTable();
}

loadData();

// ===== RENDER TABLE =====
function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const pageData = filteredData.slice(start, start + pageSize);

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    pageData.forEach(item => {
        const tr = document.createElement("tr");

        tr.title = item.description || "";

        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.price}</td>
            <td>${item.category?.name || ""}</td>
            <td>
                <img src="${item.images?.[0] || ""}"
                     onerror="this.src='https://placehold.co/60x60?text=No+Image'"
                     style="width:60px;height:60px;object-fit:cover;border-radius:6px">
            </td>
        `;

        tbody.appendChild(tr);
    });

    document.getElementById("pageInfo").innerText =
        `Page ${currentPage}`;
}

// ===== SEARCH =====
document.getElementById("searchInput")
.addEventListener("input", e => {

    const value = e.target.value.toLowerCase();

    filteredData = allData.filter(p =>
        p.title.toLowerCase().includes(value)
    );

    currentPage = 1;
    renderTable();
});

// ===== PAGE SIZE =====
document.getElementById("pageSize")
.addEventListener("change", e => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
});

// ===== PAGINATION =====
document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) currentPage--;
    renderTable();
};

document.getElementById("nextBtn").onclick = () => {
    if (currentPage * pageSize < filteredData.length)
        currentPage++;
    renderTable();
};

// ===== SORT =====
let titleAsc = true;
let priceAsc = true;

document.getElementById("sortTitle").onclick = () => {
    filteredData.sort((a, b) =>
        titleAsc
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title)
    );
    titleAsc = !titleAsc;
    renderTable();
};

document.getElementById("sortPrice").onclick = () => {
    filteredData.sort((a, b) =>
        priceAsc ? a.price - b.price : b.price - a.price
    );
    priceAsc = !priceAsc;
    renderTable();
};

// ===== EXPORT CSV =====
document.getElementById("exportBtn").onclick = () => {

    const start = (currentPage - 1) * pageSize;
    const pageData = filteredData.slice(start, start + pageSize);

    let csv = "id,title,price,category\n";

    pageData.forEach(p => {
        csv += `${p.id},${p.title},${p.price},${p.category?.name}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "products.csv";
    link.click();
};

// ===== CREATE MODAL =====
let createModal;

// Đợi Bootstrap load xong
window.addEventListener("load", () => {

    createModal = new bootstrap.Modal(
        document.getElementById("createModal")
    );

    document.getElementById("createBtn").onclick = () => {
        createModal.show();
    };
});

// ===== SAVE CREATE =====
document.getElementById("saveCreate").onclick = async () => {

    const title = document.getElementById("newTitle").value.trim();
    const price = parseInt(document.getElementById("newPrice").value);
    const description = document.getElementById("newDesc").value.trim();

    if (!title || !price) {
        alert("Please enter title and price");
        return;
    }

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            price,
            description,
            categoryId: 1,
            images: ["https://placehold.co/600x400"]
        })
    });

    createModal.hide();
    loadData();
};
