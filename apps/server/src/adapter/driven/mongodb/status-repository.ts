import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import {
  createStatusSubscriber,
  type StatusComponent,
  type Incident,
  type IncidentUpdate,
  type StatusSubscriber,
} from "../../../domain/entity/status.js";
import type { MongoDBClient } from "./client.js";

// ── Status Component ─────────────────────────────────────────────────────────

interface StatusComponentDoc {
  _id: ObjectId;
  name: string;
  description?: string;
  status: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

function componentToDoc(c: StatusComponent): StatusComponentDoc {
  return {
    _id: new ObjectId(c.id),
    name: c.name,
    description: c.description,
    status: c.status,
    order: c.order,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function componentFromDoc(d: StatusComponentDoc): StatusComponent {
  return {
    id: d._id.toHexString(),
    name: d.name,
    description: d.description,
    status: d.status as StatusComponent["status"],
    order: d.order,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

// ── Incident ─────────────────────────────────────────────────────────────────

interface IncidentUpdateDoc {
  status: string;
  body: string;
  created_at: Date;
}

interface IncidentDoc {
  _id: ObjectId;
  title: string;
  impact: string;
  status: string;
  affected_components: string[];
  updates: IncidentUpdateDoc[];
  started_at: Date;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function updateToDoc(u: IncidentUpdate): IncidentUpdateDoc {
  return { status: u.status, body: u.body, created_at: u.createdAt };
}

function updateFromDoc(d: IncidentUpdateDoc): IncidentUpdate {
  return { status: d.status, body: d.body, createdAt: d.created_at };
}

function incidentToDoc(i: Incident): IncidentDoc {
  return {
    _id: new ObjectId(i.id),
    title: i.title,
    impact: i.impact,
    status: i.status,
    affected_components: i.affectedComponents,
    updates: (i.updates ?? []).map(updateToDoc),
    started_at: i.startedAt,
    resolved_at: i.resolvedAt,
    created_at: i.createdAt,
    updated_at: i.updatedAt,
  };
}

function incidentFromDoc(d: IncidentDoc): Incident {
  return {
    id: d._id.toHexString(),
    title: d.title,
    impact: d.impact as Incident["impact"],
    status: d.status as Incident["status"],
    affectedComponents: d.affected_components ?? [],
    updates: (d.updates ?? []).map(updateFromDoc),
    startedAt: d.started_at,
    resolvedAt: d.resolved_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

// ── Status Subscriber ────────────────────────────────────────────────────────

interface StatusSubscriberDoc {
  _id: ObjectId;
  email: string;
  created_at: Date;
}

function subscriberToDoc(s: StatusSubscriber): StatusSubscriberDoc {
  return {
    _id: new ObjectId(s.id),
    email: s.email,
    created_at: s.createdAt,
  };
}

function subscriberFromDoc(d: StatusSubscriberDoc): StatusSubscriber {
  return {
    id: d._id.toHexString(),
    email: d.email,
    createdAt: d.created_at,
  };
}

// ── Repository ───────────────────────────────────────────────────────────────

export class MongoStatusRepository {
  private readonly components: Collection<StatusComponentDoc>;
  private readonly incidents: Collection<IncidentDoc>;
  private readonly subscribers: Collection<StatusSubscriberDoc>;

  constructor(client: MongoDBClient) {
    this.components = client.collection<StatusComponentDoc>("status_components");
    this.incidents = client.collection<IncidentDoc>("incidents");
    this.subscribers = client.collection<StatusSubscriberDoc>("status_subscribers");
  }

  // Components

  async listComponents(): Promise<StatusComponent[]> {
    const docs = await this.components.find({}).sort({ order: 1, created_at: 1 }).toArray();
    return docs.map(componentFromDoc);
  }

  async createComponent(component: StatusComponent): Promise<StatusComponent> {
    await this.components.insertOne(componentToDoc(component));
    return component;
  }

  async updateComponent(component: StatusComponent): Promise<StatusComponent> {
    const doc = componentToDoc({ ...component, updatedAt: new Date() });
    const { _id, created_at, ...rest } = doc;
    await this.components.updateOne({ _id }, { $set: rest });
    return componentFromDoc(doc);
  }

  async deleteComponent(id: string): Promise<void> {
    await this.components.deleteOne({ _id: new ObjectId(id) });
  }

  // Incidents

  async listIncidents(filter?: { active?: boolean }): Promise<Incident[]> {
    const query: Record<string, any> = {};
    if (filter?.active) query.status = { $ne: "resolved" };
    const docs = await this.incidents.find(query).sort({ started_at: -1, created_at: -1 }).toArray();
    return docs.map(incidentFromDoc);
  }

  async getIncident(id: string): Promise<Incident | null> {
    const doc = await this.incidents.findOne({ _id: new ObjectId(id) });
    return doc ? incidentFromDoc(doc) : null;
  }

  async createIncident(incident: Incident): Promise<Incident> {
    await this.incidents.insertOne(incidentToDoc(incident));
    return incident;
  }

  async updateIncident(incident: Incident): Promise<Incident> {
    const doc = incidentToDoc({ ...incident, updatedAt: new Date() });
    const { _id, created_at, ...rest } = doc;
    await this.incidents.updateOne({ _id }, { $set: rest });
    return incidentFromDoc(doc);
  }

  // Subscribers

  async addSubscriber(email: string): Promise<StatusSubscriber> {
    const subscriber = createStatusSubscriber({ email });
    await this.subscribers.insertOne(subscriberToDoc(subscriber));
    return subscriber;
  }

  async listSubscribers(): Promise<StatusSubscriber[]> {
    const docs = await this.subscribers.find({}).sort({ created_at: -1 }).toArray();
    return docs.map(subscriberFromDoc);
  }
}
