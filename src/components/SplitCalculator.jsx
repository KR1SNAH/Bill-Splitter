import { useEffect, useState } from "react";
import styles from "./SplitCalculator.module.css";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';

const SplitCalculator = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: "",
        price: "",
        quantity: 1,
        sharedBy: [],
    });
    const [newPerson, setNewPerson] = useState("");
    const [people, setPeople] = useState({});

    const grandTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );


    const addNewPerson = () => {
        if (!newPerson.trim()) {
            toast.error("Please enter a valid name");
            return;
        }
        if (newPerson in people) {
            toast.error("This person already exists!");
            return;
        }
        setPeople({ ...people, [newPerson]: { amount: 0 } });
        setNewPerson("");
    };

    useEffect(() => {
        const newPeople = {};
        Object.keys(people).forEach((p) => (newPeople[p] = { amount: 0 }));

        items.forEach((item) => {
            if (item.sharedBy.length === 0) return; // skip items with no people
            const totalCost = item.price * item.quantity;
            const share = totalCost / item.sharedBy.length;
            item.sharedBy.forEach((p) => (newPeople[p].amount += share));
        });

        setPeople(newPeople);
    }, [items]);


    const addNewItem = () => {
        if (!newItem.name.trim() || !newItem.price) {
            toast.error("Enter valid item details");
            return;
        }
        if (!newItem.sharedBy.length) {
            toast.error("Select at least one person");
            return;
        }

        // Inside addNewItem
        setItems((prev) => [
            ...prev,
            {
                id: uuidv4(),
                name: newItem.name,
                price: parseFloat(newItem.price),
                quantity: newItem.quantity || 1,
                sharedBy: newItem.sharedBy,
            },
        ]);

        setNewItem({ name: "", price: "", quantity: 1, sharedBy: [] });
    };

    const removeItem = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Item removed!");
    };



    const exportToCSV = () => {
        if (items.length === 0) {
            toast.error("No items to export");
            return;
        }

        const headers = ["Item Name", "Price", "Quantity", "Shared By", "Total"];
        const rows = items.map((item) => [
            item.name,
            item.price.toFixed(2),
            item.quantity,
            item.sharedBy.join(", "),
            (item.price * item.quantity).toFixed(2),
        ]);

        const csvContent =
            [headers, ...rows]
                .map((row) => row.map((v) => `"${v}"`).join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "split_calculator.csv");
        link.click();

        toast.success("CSV exported successfully!");
    };


    return (
        <div className={styles.container}>
            <h1 className={styles.title}>💸 Split Calculator</h1>

            {/* People Section */}
            <div className={styles.section}>
                <div className={styles.inputRow}>
                    <input
                        type="text"
                        placeholder="Add a person..."
                        value={newPerson}
                        onChange={(e) => setNewPerson(e.target.value)}
                    />
                    <button onClick={addNewPerson}>Add</button>
                </div>
                <div className={styles.peopleGrid}>
                    {Object.keys(people).map((person) => (
                        <div key={person} className={styles.personCard}>
                            <p>{person}</p>
                            <span>${people[person].amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Item Section */}
            <div className={styles.section}>
                <div className={styles.itemForm}>
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={newItem.name}
                        onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                    />
                    <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
                    />
                </div>

                <div className={styles.checkboxGroup}>
                    {Object.keys(people).map((person) => (
                        <label key={person}>
                            <input
                                type="checkbox"
                                checked={newItem.sharedBy.includes(person)}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setNewItem((p) => {
                                        const shared = [...p.sharedBy];
                                        if (checked) shared.push(person);
                                        else shared.splice(shared.indexOf(person), 1);
                                        return { ...p, sharedBy: shared };
                                    });
                                }}
                            />
                            {person}
                        </label>
                    ))}
                </div>
                <button className={styles.addButton} onClick={addNewItem}>
                    ➕ Add Item
                </button>
            </div>

            {/* Item List */}
            <div className={styles.itemList}>
                {items.map((item) => (
                    <div key={item.id} className={styles.itemCard}>
                        <div className={styles.itemTop}>
                            <div className={styles.itemHeaderLeft}>
                                <p className={styles.itemName}>{item.name}</p>
                                <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                            </div>
                            <button
                                className={styles.deleteButton}
                                onClick={() => removeItem(item.id)}
                                title="Remove item"
                            >
                                🗑️
                            </button>
                        </div>

                        <p className={styles.itemInfo}>Quantity: {item.quantity}x</p>

                        <div className={styles.checkboxGroup}>
                            <span>Shared by: </span>
                            {Object.keys(people).map((person) => (
                                <label key={person}>
                                    <input
                                        type="checkbox"
                                        checked={item.sharedBy.includes(person)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setItems((prev) =>
                                                prev.map((i) => {
                                                    if (i.id !== item.id) return i;
                                                    const updatedShared = [...i.sharedBy];
                                                    if (checked) updatedShared.push(person);
                                                    else updatedShared.splice(updatedShared.indexOf(person), 1);
                                                    return { ...i, sharedBy: updatedShared };
                                                })
                                            );
                                        }}
                                    />
                                    {person}
                                </label>
                            ))}
                        </div>

                        <p className={styles.itemTotal}>
                            Total: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>

            <div className={styles.grandTotal}>
                <h3>Grand Total: ${grandTotal.toFixed(2)}</h3>
            </div>

            <button className={styles.exportButton} onClick={exportToCSV}>
                📄 Export to CSV
            </button>

        </div>
    );
};

export default SplitCalculator;
