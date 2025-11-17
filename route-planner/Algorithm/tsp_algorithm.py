from .data_mapper import cities

class RoutePlannerAlgorithm:
    memo = {}
    
    def __init__(self, priorities):
        self.priorities = priorities
        self.city_list = list(priorities.keys())
        self.count = len(self.city_list)
        
        coords = [cities[c] for c in self.city_list]

        priority_map = {"High": 0, "Medium": 1, "Low": 2}
        self.city_priority = [priority_map[self.priorities[c]] for c in self.city_list]

        self.dist_matrix = [[self.dist(coords[i], coords[j]) for j in range(self.count)] for i in range(self.count)]

        self.high_count = sum(1 for p in self.city_priority if p == 0)
        self.medium_count = sum(1 for p in self.city_priority if p == 1)
        self.low_count = sum(1 for p in self.city_priority if p == 2)
    
    def dist(self, a, b):
        return ((a[0]-b[0])**2 + (a[1]-b[1])**2)**0.5

    def violates_priority(self, mask, next_city):
        high_visited = sum(1 for i in range(self.count) if (mask & (1 << i)) and self.city_priority[i] == 0)
        medium_visited = sum(1 for i in range(self.count) if (mask & (1 << i)) and self.city_priority[i] == 1)
        next_priority = self.city_priority[next_city]

        if next_priority == 1 and high_visited < self.high_count:
            return True

        if next_priority == 2 and (high_visited < self.high_count or medium_visited < self.medium_count):
            return True

        return False

    def tsp(self, mask, last):
        if mask == (1 << self.count) - 1:
            return 0

        key = (mask, last)
        if key in self.memo:
            return self.memo[key]

        best = 10**9

        for nxt in range(self.count):
            if mask & (1 << nxt):
                continue

            if self.violates_priority(mask, nxt):
                continue

            cost = self.dist_matrix[last][nxt] + self.tsp(mask | (1 << nxt), nxt)
            if cost < best:
                best = cost

        self.memo[key] = best
        return best

    def reconstruct(self, start):
        mask = 1 << start
        last = start
        path = [self.city_list[start]]
        best_cost = 10**9
        
        while mask != (1 << self.count) - 1:
            best_next = None
            
            for nxt in range(self.count):
                if mask & (1 << nxt):
                    continue
                
                if self.violates_priority(mask, nxt):
                    continue

                c = self.dist_matrix[last][nxt] + self.tsp(mask | (1 << nxt), nxt)
                if c < best_cost:
                    best_cost = c
                    best_next = nxt

            path.append(self.city_list[best_next])
            mask |= (1 << best_next)
            last = best_next

        return path, best_cost