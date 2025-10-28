import RestaurantBarCard from "@/components/RestaurantBarCard";

export default function RestaurantBarPage() {
    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-4">Restaurants & Bar</h2>
            <RestaurantBarCard
                id="azure-grill"
                src="/azure.png"
                alt="The Azure Grill"
                title="The Azure Grill"
                description="Al fresco dining with Mediterranean-inspired cuisine."
            />
            <RestaurantBarCard
                id="gold-leaf-bar"
                src="/gold.png"
                alt="The Gold Leaf Bar"
                title="The Gold Leaf Bar"
                description="Expertly crafted cocktails and rare spirits in an intimate setting."
            />
            <RestaurantBarCard
                id="crystal-room"
                src="/crystal.png"
                alt="The Crystal Room"
                title="The Crystal Room"
                description="Fine dining with a contemporary twist on classic European cuisine."
            />
        </div>
    );
}