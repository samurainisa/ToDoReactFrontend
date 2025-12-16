import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";

export function UiKitPage() {
  return (
    <main className="page page--ui">
      <div className="ui-grid">
        <Card className="ui-card" title="Buttons">
          <div className="ui-row">
            <Button label="Primary" icon="pi pi-check" />
            <Button label="Outlined" icon="pi pi-arrow-right" outlined />
            <Button label="Text" icon="pi pi-heart" text />
          </div>
        </Card>

        <Card className="ui-card" title="Inputs">
          <div className="ui-row">
            <span className="p-float-label ui-input">
              <InputText id="login" defaultValue="jane@example.com" />
              <label htmlFor="login">Email</label>
            </span>
            <span className="p-float-label ui-input">
              <InputText id="search" defaultValue="Поиск" />
              <label htmlFor="search">Search</label>
            </span>
          </div>
        </Card>

        <Card className="ui-card" title="Tags & Message">
          <div className="ui-row">
            <Tag value="Stable" severity="success" />
            <Tag value="Beta" severity="info" />
            <Tag value="Blocked" severity="danger" />
          </div>
          <div className="ui-row">
            <Message severity="warn" text="Обновите данные" />
          </div>
        </Card>
      </div>
    </main>
  );
}

