import tkinter as tk
from tkinter import ttk, messagebox
from Algorithm.data_mapper import cities
from Algorithm.tsp_algorithm import RoutePlannerAlgorithm

class RoutePlannerUI:
    def __init__(self, root):
        self.city_names = list(cities.keys())
        self.root = root
        self.root.title("route planner")
        self.root.geometry("500x500")
        self.places = []

        input_frame = ttk.Frame(root, padding=10)
        input_frame.pack(fill="x")

        ttk.Label(input_frame, text="Place name:").grid(row=0, column=0, padx=5, pady=5)
        self.place_entry = ttk.Combobox(
            input_frame,
            textvariable=self.city_names[0],
            values=self.city_names,
            state="readonly",
            width=27
        )
        self.place_entry.grid(row=0, column=1, padx=5, pady=5)

        ttk.Label(input_frame, text="Priority:").grid(row=1, column=0, padx=5, pady=5)

        self.priority_var = tk.StringVar(value="Medium")
        self.priority_menu = ttk.Combobox(
            input_frame,
            textvariable=self.priority_var,
            values=["High", "Medium", "Low"],
            state="readonly",
            width=27,
        )
        self.priority_menu.grid(row=1, column=1, padx=5, pady=5)

        add_btn = ttk.Button(input_frame, text="Add place", command=self.add_place)
        add_btn.grid(row=2, column=0, columnspan=2, pady=10)
        
        list_frame = ttk.Frame(root, padding=10)
        list_frame.pack(fill="both", expand=True)

        ttk.Label(list_frame, text="Places ddded:").pack(anchor="w")

        self.place_listbox = tk.Listbox(list_frame, height=10)
        self.place_listbox.pack(fill="both", expand=True, pady=5)

        solve_btn = ttk.Button(root, text="Get route", command=self.solve_tsp)
        solve_btn.pack(pady=10)

        route_frame = ttk.Frame(root, padding=10)
        route_frame.pack(fill="both", expand=True)

        ttk.Label(route_frame, text="Optimised Route").pack(anchor="w")

        self.route_text = tk.Text(route_frame, height=5)
        self.route_text.pack(fill="both", expand=True)

    def add_place(self):
        place = self.place_entry.get().strip()
        priority = self.priority_var.get()

        if not place:
            messagebox.showwarning("Input error", "Place name cannot be empty.")
            return
        
        self.places.append((place, priority))

        self.place_listbox.insert(tk.END, f"{place}: {priority}")
        self.place_entry.delete(0, tk.END)
        self.priority_var.set("Medium")

    def solve_tsp(self):
        if not self.places:
            messagebox.showwarning("No places", "Please add at least one place.")
            return
        
        city_map = {}
        start = -1
        for i, value in enumerate(self.places):
            city_map[value[0]] = value[1]
            
            if value[1] == "High" and start == -1:
                start = i
        
        algo = RoutePlannerAlgorithm(priorities=city_map)
        
        route, cost = algo.reconstruct(start)
        route_string = " → ".join(route)
        cost_string = f"\nTotal Distance: {cost}"

        self.route_text.delete(1.0, tk.END)
        self.route_text.insert(tk.END, route_string)
        self.route_text.insert(tk.END, cost_string)