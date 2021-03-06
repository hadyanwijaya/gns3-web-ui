import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { D3, D3Service } from 'd3-ng2-service';
import { Selection } from 'd3-selection';

import { Node } from "../models/node";
import { Link } from "../models/link";
import { GraphLayout } from "./models/graph-layout";
import { Context } from "./models/context";
import { Size } from "./models/size";


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() nodes: Node[] = [];
  @Input() links: Link[] = [];
  @Input() width = 1500;
  @Input() height = 600;
  @Input() phylloRadius = 7;
  @Input() pointRadius= 2;

  private d3: D3;
  private parentNativeElement: any;
  private svg: Selection<SVGSVGElement, any, null, undefined>;

  private graphLayout: GraphLayout;
  private graphContext: Context;

  constructor(protected element: ElementRef,
              protected d3Service: D3Service
              ) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (
      (changes['width'] && !changes['width'].isFirstChange()) ||
      (changes['height'] && !changes['height'].isFirstChange()) ||
      (changes['phylloRadius'] && !changes['phylloRadius'].isFirstChange()) ||
      (changes['pointRadius'] && !changes['pointRadius'].isFirstChange()) ||
      (changes['nodes'] && !changes['nodes'].isFirstChange()) ||
      (changes['links'] && !changes['links'].isFirstChange())
    ) {
      if (this.svg.empty && !this.svg.empty()) {
        if (changes['nodes']) {
          this.onNodesChange(changes['nodes']);
        }
        if (changes['links']) {
          this.onLinksChange(changes['links']);
        }
        this.changeLayout();
      }
    }
  }

  ngOnDestroy() {
    if (this.svg.empty && !this.svg.empty()) {
      this.svg.selectAll('*').remove();
    }
  }

  ngOnInit() {
    const d3 = this.d3;

    let rootElement: Selection<HTMLElement, any, null, undefined>;

    const self = this;

    if (this.parentNativeElement !== null) {
      rootElement = d3.select(this.parentNativeElement);

      this.svg = rootElement.select<SVGSVGElement>('svg');

      this.graphContext = new Context(this.svg);

      this.graphContext.setSize(new Size(this.width, this.height));

      this.graphLayout = new GraphLayout();
      this.graphLayout.draw(this.svg, this.graphContext);

    }
  }

  private changeLayout() {
    this.svg
      .attr('width', this.width)
      .attr('height', this.height);

    this.graphLayout.setNodes(this.nodes);
    this.graphLayout.setLinks(this.links);

    this.redraw();
  }

  private onLinksChange(change: SimpleChange) {
    const nodes_by_id = {};
    this.nodes.forEach((n: Node) => {
      nodes_by_id[n.node_id] = n;
    });

    this.links.forEach((link: Link) => {
      const source_id = link.nodes[0].node_id;
      const target_id = link.nodes[1].node_id;
      if (source_id in nodes_by_id) {
        link.source = nodes_by_id[source_id];
      }
      if (target_id in nodes_by_id) {
        link.target = nodes_by_id[target_id];
      }
    });
  }

  private onNodesChange(change: SimpleChange) {
    this.onLinksChange(null);
  }

  public redraw() {
    this.graphLayout.draw(this.svg, this.graphContext);
  }

  public reload() {
    this.onLinksChange(null);
    this.redraw();
  }
}
