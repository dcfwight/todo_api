var person = {
    name: "doug",
    age: 21
}

function updatePerson(obj) {
    obj = {
        name: "Doug",
        age: 24
    }
}

updatePerson(person);
console.log(person);
// this does not change person

function updatePerson2(obj) {
    obj.age = 24;
}

updatePerson2(person);
console.log(person);

// Array Example
// make an array of grades with two values
// fucntion addGrade, pushes on a new value.
// one a new array that gets pushed, another which doesn't work.

var grades = [15,35];

function addGrade(array) {
    array = [15,35,60]
}

addGrade(grades);
console.log(grades);

function addGrade2(array, grade) {
    array.push(grade);
    debugger;
}

addGrade2(grades, 60);
console.log(grades);