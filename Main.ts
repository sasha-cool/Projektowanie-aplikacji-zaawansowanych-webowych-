/**
 * Projekt Elektro-Bud
 * Programowanie aplikacji zaawansowanych webowych – TypeScript
 * 
 * Zakres funkcjonalny:
 * Aplikacja wspomaga pracę magazynu Elektro-Bud poprzez zarządzanie listą produktów.
 * Umożliwia wyświetlanie listy, dodawanie nowych pozycji, edycję istniejących, 
 * usuwanie produktów oraz zapis i odczyt stanu aplikacji w localStorage.
 */

// Definicja interfejsu reprezentującego produkt w magazynie
interface Product {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
}

class WarehouseApp {
    private products: Product[] = [];
    private editingProductId: string | null = null;

    // Pobranie elementów DOM
    private productList = document.getElementById('product-list') as HTMLTableSectionElement;
    private productForm = document.getElementById('product-form') as HTMLFormElement;
    private nameInput = document.getElementById('product-name') as HTMLInputElement;
    private qtyInput = document.getElementById('product-qty') as HTMLInputElement;
    private priceInput = document.getElementById('product-price') as HTMLInputElement;
    private categoryInput = document.getElementById('product-category') as HTMLSelectElement;
    private formSubmitBtn = document.getElementById('form-submit-btn') as HTMLButtonElement;
    private cancelEditBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;

    constructor() {
        this.init();
    }

    private init(): void {
        // Ocena 6: Odczyt danych z localStorage lub inicjalizacja pustej bazy
        const storedProducts = localStorage.getItem('elektro_bud_products');
        if (storedProducts) {
            try {
                this.products = JSON.parse(storedProducts);
            } catch (e) {
                console.error("Błąd podczas odczytu danych z localStorage", e);
                this.products = [];
            }
        } else {
            // Przykładowe dane początkowe, jeśli localStorage jest pusty
            this.products = [
                { id: '1', name: 'Kabel miedziany NYM-J 3x1.5', quantity: 150, price: 3.50, category: 'Kable' },
                { id: '2', name: 'Wyłącznik nadprądowy B16', quantity: 45, price: 12.90, category: 'Aparatura' }
            ];
            this.saveToStorage();
        }

        // Rejestracja zdarzeń
        this.productForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.cancelEditBtn.addEventListener('click', () => this.resetForm());

        // Pierwsze renderowanie listy
        this.renderProducts();
    }

    // Ocena 6: Zapis aktualnego stanu do localStorage
    private saveToStorage(): void {
        localStorage.setItem('elektro_bud_products', JSON.stringify(this.products));
    }

    // Wyświetlanie listy produktów
    private renderProducts(): void {
        this.productList.innerHTML = '';

        if (this.products.length === 0) {
            this.productList.innerHTML = `<tr><td colspan="6" class="text-center">Magazyn jest pusty.</td></tr>`;
            return;
        }

        this.products.forEach((product, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${this.escapeHtml(product.name)}</strong></td>
                <td>${this.escapeHtml(product.category)}</td>
                <td>${product.quantity} szt.</td>
                <td>${product.price.toFixed(2)} zł</td>
                <td>
                    <button class="btn btn-edit" data-id="${product.id}">Edytuj</button>
                    <button class="btn btn-delete" data-id="${product.id}">Usuń</button>
                </td>
            `;

            // Podpięcie akcji do przycisków w wierszu
            row.querySelector('.btn-edit')?.addEventListener('click', () => this.loadProductToEdit(product.id));
            row.querySelector('.btn-delete')?.addEventListener('click', () => this.deleteProduct(product.id));

            this.productList.appendChild(row);
        });
    }

    // Dodawanie i edycja produktu
    private handleFormSubmit(e: Event): void {
        e.preventDefault();

        const name = this.nameInput.value.trim();
        const quantity = parseInt(this.qtyInput.value);
        const price = parseFloat(this.priceInput.value);
        const category = this.categoryInput.value;

        if (!name || isNaN(quantity) || isNaN(price)) {
            alert('Proszę poprawnie wypełnić wszystkie pola.');
            return;
        }

        if (this.editingProductId) {
            // Edycja istniejącego produktu
            const product = this.products.find(p => p.id === this.editingProductId);
            if (product) {
                product.name = name;
                product.quantity = quantity;
                product.price = price;
                product.category = category;
            }
            this.editingProductId = null;
        } else {
            // Dodawanie nowego produktu
            const newProduct: Product = {
                id: Date.now().toString(), // generowanie prostego unikalnego ID
                name,
                quantity,
                price,
                category
            };
            this.products.push(newProduct);
        }

        this.saveToStorage();
        this.renderProducts();
        this.resetForm();
    }

    // Załadowanie danych produktu do formularza przed edycją
    private loadProductToEdit(id: string): void {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.editingProductId = product.id;
        this.nameInput.value = product.name;
        this.qtyInput.value = product.quantity.toString();
        this.priceInput.value = product.price.toString();
        this.categoryInput.value = product.category;

        this.formSubmitBtn.textContent = 'Zapisz zmiany';
        this.cancelEditBtn.classList.remove('hidden');
    }

    // Usuwanie produktu
    private deleteProduct(id: string): void {
        if (confirm('Czy na pewno chcesz usunąć ten produkt z magazynu?')) {
            this.products = this.products.filter(p => p.id !== id);
            
            // Jeśli usuwamy obiekt, który akurat był edytowany, czyścimy formularz
            if (this.editingProductId === id) {
                this.resetForm();
            }

            this.saveToStorage();
            this.renderProducts();
        }
    }

    private resetForm(): void {
        this.productForm.reset();
        this.editingProductId = null;
        this.formSubmitBtn.textContent = 'Dodaj produkt';
        this.cancelEditBtn.classList.add('hidden');
    }

    // Zabezpieczenie przed atakami XSS przy renderowaniu tekstu wpisanego przez użytkownika
    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

// Inicjalizacja aplikacji po załadowaniu drzewa DOM
document.addEventListener('DOMContentLoaded', () => {
    new WarehouseApp();
});
