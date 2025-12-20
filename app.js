// app.js
console.log("User Management App Started!");

// Example users array
let users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
];

// Function to list users
function listUsers() {
    console.log("Current Users:");
    users.forEach(user => console.log(`${user.id}: ${user.name}`));
}

// Function to add a user
function addUser(name) {
    const id = users.length + 1;
    users.push({ id, name });
    console.log(`Added user: ${name}`);
}

// Test functions
listUsers();
addUser("Charlie");
listUsers();
