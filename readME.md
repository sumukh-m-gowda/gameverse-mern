# Traffic Challan Management System

A Digital Traffic Fine and Challan Management System developed in C using Data Structures. The project allows users to register vehicles, manage traffic violations, track fines, and maintain payment history through an efficient command-line interface.

## Features

- Vehicle registration
- Search vehicle by license number
- Remove registered vehicles
- Display all registered vehicles
- Add traffic challans
- Pay pending fines
- View offense history
- View payment history
- Dynamic memory management

## Data Structures Used

- Binary Search Tree (BST)
  - Stores vehicle records for efficient insertion, searching, and deletion.
- Linked List
  - Maintains multiple challans associated with each vehicle.
- Stack
  - Stores payment history for recently paid fines.

## Project Structure

```
.
├── main.c          # Menu-driven application
├── traffic.c       # Core implementation
├── traffic.h       # Header file and data structures
└── dsa_mini_project_PPT.pptx
```

## Technologies

- C Programming
- Data Structures
- GCC Compiler
- Command Line Interface (CLI)

## System Functionalities

- Register a new vehicle
- Search vehicle details
- Delete vehicle records
- Display all registered vehicles
- Issue traffic challans
- Pay outstanding fines
- View offense history
- View payment history

## How to Compile

```bash
gcc main.c traffic.c -o traffic
```

## Run

```bash
./traffic
```

On Windows:

```bash
traffic.exe
```

## Sample Menu

```
1. Register Vehicle
2. Search Vehicle
3. Remove Vehicle
4. Display All Vehicles
5. Add Challan
6. Pay Fine
7. View Offense History
8. View Payment History
9. Exit
```

## Learning Outcomes

- Binary Search Tree operations
- Linked List implementation
- Stack implementation
- Dynamic memory allocation
- Modular programming in C
- File organization using header files
- Menu-driven application development

## Future Improvements

- Persistent file/database storage
- User authentication
- Admin dashboard
- Fine analytics and reports
- Search by owner details
- Vehicle update functionality
- Graphical User Interface (GUI)

## Author

Developed as a Data Structures Mini Project.
