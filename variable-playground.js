var person = {
    name:'Andrew',
    age:21
};

function updatePerson(obj) {
    obj = {
        name: "Andrew",
        age: 24
    };
}


updatePerson(person); // this will not change the person object.
console.log(person);

function updatePerson2(obj) {
    obj.age = 24;// this WILL update it.
}


updatePerson2(person)
console.log(person);

// Array example
var exampleArray = [15,37]

function addGrade(array, number) {
    array = [15, 37, number];
}

addGrade(exampleArray, 40);
console.log(exampleArray);

function addGrade2(array, number) {
    array.push(number);
    debugger;
}

addGrade2(exampleArray, 40);
console.log(exampleArray);
