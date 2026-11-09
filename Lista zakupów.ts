type FilterType = "all" | "active" | "bought";

class ShoppingItem {
  public id: number;
  public name: string;
  public quantity: number;
  public bought: boolean;

  constructor(name: string, quantity: number, bought = false) {
    this.id = Date.now() + Math.floor(Math.random() * 10000);
    this.name = name.trim();
    this.quantity = quantity;
    this.bought = bought;
  }

  static validateName(name: string): boolean {
    return name.trim().length > 0;
  }

  static validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0;
  }
}

class ShoppingList {
  private items: ShoppingItem[] = [];

  addItem(name: string, quantity: number): ShoppingItem {
    if (!ShoppingItem.validateName(name)) {
      throw new Error("Nazwa produktu nie może być pusta.");
    }

    if (!ShoppingItem.validateQuantity(quantity)) {
      throw new Error("Ilość musi być liczbą całkowitą większą od 0.");
    }

    const normalizedName = name.trim().toLowerCase();

    const existingItem = this.items.find(
      (item) => item.name.toLowerCase() === normalizedName
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      return existingItem;
    }

    const newItem = new ShoppingItem(name, quantity);
    this.items.push(newItem);
    return newItem;
  }

  removeItem(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  toggleBought(id: number): void {
    const item = this.items.find((element) => element.id === id);
    if (item) {
      item.bought = !item.bought;
    }
  }

  getItems(filter: FilterType = "all"): ShoppingItem[] {
    switch (filter) {
      case "active":
        return this.items.filter((item) => !item.bought);
      case "bought":
        return this.items.filter((item) => item.bought);
      default:
        return [...this.items];
    }
  }

  getItemsToBuyCount(): number {
    return this.items
      .filter((item) => !item.bought)
      .reduce((sum, item) => sum + item.quantity, 0);
  }
}

const shoppingList = new ShoppingList();

function render(): void {
  const activeFilter = document.querySelector(
    'input[name="filter"]:checked'
  ) as HTMLInputElement;

  const filter: FilterType = (activeFilter?.value as FilterType) || "all";
  const items = shoppingList.getItems(filter);

  const listElement = document.getElementById("list") as HTMLUListElement;
  const countText = document.getElementById("countText") as HTMLSpanElement;

  countText.textContent = shoppingList.getItemsToBuyCount().toString();

  listElement.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.className = "item-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.bought;
    checkbox.addEventListener("change", () => {
      shoppingList.toggleBought(item.id);
      render();
    });

    const name = document.createElement("span");
    name.textContent = item.name;
    name.className = item.bought ? "item-name bought" : "item-name";

    const qty = document.createElement("span");
    qty.textContent = `${item.quantity} szt.`;
    qty.className = "qty";

    left.appendChild(checkbox);
    left.appendChild(name);
    left.appendChild(qty);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Usuń";
    removeButton.className = "delete-btn";
    removeButton.addEventListener("click", () => {
      shoppingList.removeItem(item.id);
      render();
    });

    li.appendChild(left);
    li.appendChild(removeButton);

    listElement.appendChild(li);
  });
}

document.getElementById("addButton")?.addEventListener("click", () => {
  const nameInput = document.getElementById("nameInput") as HTMLInputElement;
  const qtyInput = document.getElementById("qtyInput") as HTMLInputElement;

  try {
    const name = nameInput.value;
    const quantity = Number(qtyInput.value);

    const item = shoppingList.addItem(name, quantity);
    console.log("Dodano produkt:", item);

    nameInput.value = "";
    qtyInput.value = "1";
    nameInput.focus();

    render();
  } catch (error) {
    alert((error as Error).message);
  }
});

document.querySelectorAll('input[name="filter"]').forEach((radio) => {
  radio.addEventListener("change", render);
});

shoppingList.addItem("Jabłka", 3);
shoppingList.addItem("Chleb", 2);
shoppingList.addItem("Jabłka", 2);
shoppingList.toggleBought(shoppingList.getItems("all")[0].id);

render();
