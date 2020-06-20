import { Component, ChangeEvent } from "react";
import IGCParser from "glana/src/igc/parser";

export default class Home extends Component {
  track: any;

  render() {
    return (
      <div className="container">
        <h1 className="title text-purple-500">Hello</h1>
        <input type="file" onChange={this.loadIGC.bind(this)} />

        <style jsx>{`
          .container {
            min-height: 100vh;
            padding: 0 0.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
        `}</style>

        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </div>
    );
  }

  private loadIGC(event: ChangeEvent) {
    let target = event.currentTarget as any;
    let files = target.files;

    if (!files) {
      return;
    }

    this.readFile(files[0]);
  }

  private readFile(file: Blob) {
    let reader = new FileReader();
    reader.onload = this.parseIGC.bind(this);
    reader.readAsText(file);
  }

  private parseIGC(event: any) {
    let parser = new IGCParser();
    this.track = parser.parse(event.target.result as string);
  }
}
