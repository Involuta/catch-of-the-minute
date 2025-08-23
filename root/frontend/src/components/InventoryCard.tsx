import React from "react";
import { InventoryItem } from "../types";

export default function InventoryCard({ item }: { item: InventoryItem }) {
  return (
    <div className={"card " + (item.alive ? "" : "dead")}>
      <h3>
        {item.name} <small>#{item.number}</small>
      </h3>
      <div>Power: {item.power}</div>
      <div>Status: {item.alive ? "Alive" : "Devoured"}</div>
      <div>
        Caught: {new Date(item.caughtAt.seconds * 1000).toLocaleString()}
      </div>
    </div>
  );
}
