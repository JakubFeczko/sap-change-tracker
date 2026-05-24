import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Box,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  FileCode2,
  GitBranch,
  Layers3,
  Network,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { sampleObjects } from "./data/sampleProject";
import type { SapObject, SapObjectType, VerificationStatus, ViewMode } from "./types";

const typeLabels: Record<SapObjectType, string> = {
  CDS: "CDS",
  Class: "Class",
  "Data Element": "Data Element",
  Domain: "Domain",
  Program: "Program",
  "UI5 File": "UI5",
};

const statusLabels: Record<VerificationStatus, string> = {
  verified: "Zweryfikowane",
  changed: "Zmienione",
  "needs-check": "Do sprawdzenia",
  blocked: "Problem",
};

const statusIcons: Record<VerificationStatus, typeof CheckCircle2> = {
  verified: CheckCircle2,
  changed: Clock3,
  "needs-check": CircleAlert,
  blocked: ShieldAlert,
};

const typeIcons: Record<SapObjectType, typeof Box> = {
  CDS: Database,
  Class: Layers3,
  "Data Element": FileCode2,
  Domain: Box,
  Program: SlidersHorizontal,
  "UI5 File": FileCode2,
};

const nodeTypes = {
  sapObject: SapObjectNode,
};

function SapObjectNode({ data }: NodeProps<Node<SapObject>>) {
  const object = data as SapObject;
  const Icon = typeIcons[object.type];
  const StatusIcon = statusIcons[object.status];

  return (
    <div className={`graph-node is-${object.status}`}>
      <Handle type="target" position={Position.Top} />
      <div className="graph-node__top">
        <span className="graph-node__icon">
          <Icon size={16} />
        </span>
        <span>{typeLabels[object.type]}</span>
      </div>
      <strong>{object.name}</strong>
      <span className="graph-node__status">
        <StatusIcon size={14} />
        {statusLabels[object.status]}
      </span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function App() {
  const [objects, setObjects] = useState(sampleObjects);
  const [selectedId, setSelectedId] = useState(objects[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<SapObjectType | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("structure");

  const selectedObject = objects.find((object) => object.id === selectedId) ?? objects[0];

  const filteredObjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return objects.filter((object) => {
      const matchesType = typeFilter === "all" || object.type === typeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        object.name.toLowerCase().includes(normalizedQuery) ||
        object.path.toLowerCase().includes(normalizedQuery) ||
        object.packageName.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [objects, query, typeFilter]);

  const stats = useMemo(() => {
    const total = objects.length;
    const verified = objects.filter((object) => object.status === "verified").length;
    const changed = objects.filter((object) => object.status === "changed").length;
    const needsCheck = objects.filter((object) => object.status === "needs-check").length;

    return { total, verified, changed, needsCheck };
  }, [objects]);

  const graph = useMemo(() => {
    const visibleIds = new Set(filteredObjects.map((object) => object.id));
    const nodes: Node<SapObject>[] = filteredObjects.map((object, index) => ({
      id: object.id,
      type: "sapObject",
      position: {
        x: (index % 4) * 270,
        y: Math.floor(index / 4) * 190,
      },
      data: object,
    }));

    const edges: Edge[] = filteredObjects.flatMap((object) =>
      object.dependencies
        .filter((dependencyId) => visibleIds.has(dependencyId))
        .map((dependencyId) => ({
          id: `${object.id}-${dependencyId}`,
          source: object.id,
          target: dependencyId,
          animated: object.status === "changed" || object.status === "blocked",
        })),
    );

    return { nodes, edges };
  }, [filteredObjects]);

  function updateStatus(status: VerificationStatus) {
    setObjects((currentObjects) =>
      currentObjects.map((object) =>
        object.id === selectedObject.id
          ? {
              ...object,
              status,
              lastChanged: new Date().toISOString().slice(0, 10),
            }
          : object,
      ),
    );
  }

  function updateComment(comment: string) {
    setObjects((currentObjects) =>
      currentObjects.map((object) =>
        object.id === selectedObject.id ? { ...object, comment } : object,
      ),
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">
            <GitBranch size={22} />
          </span>
          <div>
            <strong>SAP Change Tracker</strong>
            <span>Lokalna kontrola zgodności</span>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj obiektu, pakietu lub ścieżki"
          />
        </div>

        <div className="type-list" aria-label="Filtr typu obiektu">
          <button
            className={typeFilter === "all" ? "is-active" : ""}
            onClick={() => setTypeFilter("all")}
          >
            Wszystkie
          </button>
          {(Object.keys(typeLabels) as SapObjectType[]).map((type) => (
            <button
              key={type}
              className={typeFilter === type ? "is-active" : ""}
              onClick={() => setTypeFilter(type)}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>

        <div className="object-list">
          {filteredObjects.map((object) => {
            const Icon = typeIcons[object.type];
            const StatusIcon = statusIcons[object.status];

            return (
              <button
                key={object.id}
                className={`object-row ${selectedObject?.id === object.id ? "is-selected" : ""}`}
                onClick={() => setSelectedId(object.id)}
              >
                <span className="object-row__icon">
                  <Icon size={18} />
                </span>
                <span className="object-row__content">
                  <strong>{object.name}</strong>
                  <small>{object.packageName}</small>
                </span>
                <span className={`status-dot is-${object.status}`} title={statusLabels[object.status]}>
                  <StatusIcon size={14} />
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>Projekt</p>
            <h1>ZSD Fiori Sales Overview</h1>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === "structure" ? "is-active" : ""}
              onClick={() => setViewMode("structure")}
              title="Widok struktury"
            >
              <Layers3 size={17} />
              Struktura
            </button>
            <button
              className={viewMode === "graph" ? "is-active" : ""}
              onClick={() => setViewMode("graph")}
              title="Widok grafu zależności"
            >
              <Network size={17} />
              Graf
            </button>
          </div>
        </header>

        <section className="metrics" aria-label="Status projektu">
          <Metric label="Obiekty" value={stats.total} />
          <Metric label="Zweryfikowane" value={stats.verified} tone="green" />
          <Metric label="Zmienione" value={stats.changed} tone="amber" />
          <Metric label="Do sprawdzenia" value={stats.needsCheck} tone="blue" />
        </section>

        {viewMode === "structure" ? (
          <section className="content-grid">
            <div className="structure-panel">
              <div className="section-heading">
                <h2>Struktura obiektów</h2>
                <span>{filteredObjects.length} wyników</span>
              </div>
              <div className="table">
                {filteredObjects.map((object) => (
                  <button
                    key={object.id}
                    className={`table-row ${selectedObject?.id === object.id ? "is-selected" : ""}`}
                    onClick={() => setSelectedId(object.id)}
                  >
                    <span>
                      <strong>{object.name}</strong>
                      <small>{object.path}</small>
                    </span>
                    <span>{typeLabels[object.type]}</span>
                    <span>{object.dependencies.length}</span>
                    <span className={`status-pill is-${object.status}`}>
                      {statusLabels[object.status]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <ObjectDetails
              object={selectedObject}
              objects={objects}
              onStatusChange={updateStatus}
              onCommentChange={updateComment}
            />
          </section>
        ) : (
          <section className="graph-panel">
            <ReactFlow
              nodes={graph.nodes}
              edges={graph.edges}
              nodeTypes={nodeTypes}
              fitView
              onNodeClick={(_, node) => setSelectedId(node.id)}
            >
              <Background />
              <MiniMap pannable zoomable />
              <Controls />
            </ReactFlow>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "green" | "amber" | "blue";
}) {
  return (
    <div className={`metric is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ObjectDetails({
  object,
  objects,
  onStatusChange,
  onCommentChange,
}: {
  object: SapObject;
  objects: SapObject[];
  onStatusChange: (status: VerificationStatus) => void;
  onCommentChange: (comment: string) => void;
}) {
  const dependencies = object.dependencies
    .map((dependencyId) => objects.find((candidate) => candidate.id === dependencyId))
    .filter(Boolean) as SapObject[];

  return (
    <aside className="details-panel">
      <div className="section-heading">
        <h2>Szczegóły</h2>
        <span>{object.type}</span>
      </div>

      <div className="details-title">
        <strong>{object.name}</strong>
        <span>{object.path}</span>
      </div>

      <div className="status-actions" aria-label="Zmień status weryfikacji">
        {(Object.keys(statusLabels) as VerificationStatus[]).map((status) => (
          <button
            key={status}
            className={object.status === status ? "is-active" : ""}
            onClick={() => onStatusChange(status)}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      <dl className="metadata">
        <div>
          <dt>Pakiet</dt>
          <dd>{object.packageName}</dd>
        </div>
        <div>
          <dt>Właściciel</dt>
          <dd>{object.owner}</dd>
        </div>
        <div>
          <dt>Ostatnia zmiana</dt>
          <dd>{object.lastChanged}</dd>
        </div>
      </dl>

      <label className="comment-box">
        <span>Komentarz</span>
        <textarea
          value={object.comment}
          onChange={(event) => onCommentChange(event.target.value)}
          rows={5}
        />
      </label>

      <div className="dependencies">
        <div className="section-heading">
          <h3>Zależności</h3>
          <span>{dependencies.length}</span>
        </div>
        {dependencies.length > 0 ? (
          dependencies.map((dependency) => (
            <div key={dependency.id} className="dependency-row">
              <strong>{dependency.name}</strong>
              <span>{dependency.type}</span>
            </div>
          ))
        ) : (
          <p>Brak zależności dla tego obiektu.</p>
        )}
      </div>
    </aside>
  );
}
