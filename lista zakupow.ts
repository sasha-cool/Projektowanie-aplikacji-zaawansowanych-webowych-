export function validateItem(name: string, quantityText: string): string | null{
    if (!name || nazwe.trim() === ""){
        return "nazwa produktu nie moze byc pusta.";
    }

    const quantity = parseInt(quantityText, 10);
    if (isNaN(quantity) || quantity =o){
        return "ilosc musi byc liczba wieksza od zera.";
    }

    return null;
}
