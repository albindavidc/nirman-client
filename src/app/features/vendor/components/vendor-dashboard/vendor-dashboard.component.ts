import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { VendorDashboardService } from '../../services/vendor-dashboard.service';
import { VendorStats } from '../../models/vendor-dashboard.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.scss',
})
export class VendorDashboardComponent implements OnInit {
  private dashboardService = inject(VendorDashboardService);

  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('orderDistChart') orderDistChartRef!: ElementRef;
  @ViewChild('paymentDistChart') paymentDistChartRef!: ElementRef;
  @ViewChild('topItemsChart') topItemsChartRef!: ElementRef;

  stats: VendorStats | null = null;
  loading = true;
  error = false;

  private revenueChartInstance: echarts.ECharts | null = null;
  private orderDistChartInstance: echarts.ECharts | null = null;
  private paymentDistChartInstance: echarts.ECharts | null = null;
  private topItemsChartInstance: echarts.ECharts | null = null;

  ngOnInit(): void {
    this.loadStats();
  }



  loadStats(): void {
    this.loading = true;
    this.error = false;
    this.dashboardService.getVendorStats()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.initCharts();
        },
        error: (err) => {
          console.error('Error loading vendor dashboard stats:', err);
          this.error = true;
        }
      });
  }

  private initCharts(): void {
    if (!this.stats) return;

    const { revenueTrend, orderStatusDistribution, paymentStatusDistribution, topItems } = this.stats;

    setTimeout(() => {
      // 1. Revenue Trend Chart
      if (this.revenueChartRef) {
        this.revenueChartInstance = echarts.init(this.revenueChartRef.nativeElement);
        const revenueOption: EChartsOption = {
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'category', data: revenueTrend.map(d => d.month!) },
          yAxis: { type: 'value' },
          series: [{
            data: revenueTrend.map(d => d.amount!),
            type: 'line',
            smooth: true,
            areaStyle: { opacity: 0.3 },
            itemStyle: { color: '#e9c16c' }
          }]
        };
        this.revenueChartInstance.setOption(revenueOption);
      }

      // 2. Order Status Distribution
      if (this.orderDistChartRef) {
        this.orderDistChartInstance = echarts.init(this.orderDistChartRef.nativeElement);
        const orderOption: EChartsOption = {
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left', textStyle: { color: '#ccc' } },
          series: [{
            type: 'pie',
            radius: '50%',
            data: orderStatusDistribution.map(d => ({ value: d.count, name: d.status })),
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
          }]
        };
        this.orderDistChartInstance.setOption(orderOption);
      }

      // 3. Payment Status Distribution
      if (this.paymentDistChartRef) {
        this.paymentDistChartInstance = echarts.init(this.paymentDistChartRef.nativeElement);
        const paymentOption: EChartsOption = {
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#17130b', borderWidth: 2 },
            label: { show: false, position: 'center' },
            data: paymentStatusDistribution.map(d => ({ value: d.count, name: d.status })),
          }]
        };
        this.paymentDistChartInstance.setOption(paymentOption);
      }

      // 4. Top Items by Revenue
      if (this.topItemsChartRef) {
        this.topItemsChartInstance = echarts.init(this.topItemsChartRef.nativeElement);
        const topItemsOption: EChartsOption = {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: topItems.map(d => d.name!) },
          series: [{
            type: 'bar',
            data: topItems.map(d => d.revenue!),
            itemStyle: { color: '#a1d39a' }
          }]
        };
        this.topItemsChartInstance.setOption(topItemsOption);
      }

      window.addEventListener('resize', () => {
        this.revenueChartInstance?.resize();
        this.orderDistChartInstance?.resize();
        this.paymentDistChartInstance?.resize();
        this.topItemsChartInstance?.resize();
      });
    }, 0);
  }
}
