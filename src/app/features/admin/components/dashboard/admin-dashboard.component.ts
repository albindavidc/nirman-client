import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { SystemStats } from '../../../../shared/models/dashboard.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  @ViewChild('userChart') userChartRef!: ElementRef;
  @ViewChild('projectChart') projectChartRef!: ElementRef;
  @ViewChild('materialChart') materialChartRef!: ElementRef;

  stats: SystemStats | null = null;
  loading = true;
  error = false;

  private userChartInstance: echarts.ECharts | null = null;
  private projectChartInstance: echarts.ECharts | null = null;
  private materialChartInstance: echarts.ECharts | null = null;

  ngOnInit(): void {
    this.loadStats();
  }



  loadStats(): void {
    this.loading = true;
    this.error = false;
    this.dashboardService.getSystemStats()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.initCharts();
        },
        error: (err) => {
          console.error('Error loading dashboard stats:', err);
          this.error = true;
        }
      });
  }

  private initCharts(): void {
    if (!this.stats) return;

    const { users, projects, materialRequests } = this.stats.overview;

    // Use setTimeout to ensure the DOM is updated after stats are loaded
    setTimeout(() => {
      // User Distribution Chart
      if (this.userChartRef) {
        this.userChartInstance = echarts.init(this.userChartRef.nativeElement);
        const userChartOption: EChartsOption = {
          tooltip: { trigger: 'item' },
          legend: { bottom: '5%', left: 'center', textStyle: { color: '#ccc' } },
          series: [
            {
              name: 'Users',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: { borderRadius: 10, borderColor: '#17130b', borderWidth: 2 },
              label: { show: false, position: 'center' },
              emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
              labelLine: { show: false },
              data: [
                { value: users.activeUsers, name: 'Active', itemStyle: { color: '#a1d39a' } },
                { value: users.blockedUsers, name: 'Suspended', itemStyle: { color: '#ffb4ab' } },
                { value: users.totalUsers - users.activeUsers - users.blockedUsers, name: 'Inactive', itemStyle: { color: '#775a0b' } },
              ]
            }
          ]
        };
        this.userChartInstance.setOption(userChartOption);
      }

      // Project Status Chart
      if (this.projectChartRef) {
        this.projectChartInstance = echarts.init(this.projectChartRef.nativeElement);
        const projectChartOption: EChartsOption = {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: [{ type: 'category', data: ['Total', 'Active', 'Pending', 'Completed'], axisTick: { alignWithLabel: true } }],
          yAxis: [{ type: 'value' }],
          series: [
            {
              name: 'Projects',
              type: 'bar',
              barWidth: '60%',
              data: [
                { value: projects.totalProjects, itemStyle: { color: '#e9c16c' } },
                { value: projects.activeProjects, itemStyle: { color: '#a1d39a' } },
                { value: projects.pendingProjects, itemStyle: { color: '#ffb786' } },
                { value: projects.completedProjects, itemStyle: { color: '#8bd0ef' } },
              ]
            }
          ]
        };
        this.projectChartInstance.setOption(projectChartOption);
      }

      // Material Request Chart
      if (this.materialChartRef) {
        this.materialChartInstance = echarts.init(this.materialChartRef.nativeElement);
        const materialChartOption: EChartsOption = {
          tooltip: { trigger: 'item' },
          series: [
            {
              type: 'gauge',
              startAngle: 180,
              endAngle: 0,
              min: 0,
              max: materialRequests.totalMaterialRequests || 100,
              splitNumber: 5,
              itemStyle: { color: '#e9c16c' },
              progress: { show: true, width: 18 },
              pointer: { show: false },
              axisLine: { lineStyle: { width: 18 } },
              axisTick: { show: false },
              splitLine: { show: false },
              axisLabel: { show: false },
              anchor: { show: false },
              title: { show: false },
              detail: {
                valueAnimation: true,
                width: '60%',
                lineHeight: 40,
                borderRadius: 8,
                offsetCenter: [0, '-15%'],
                fontSize: 24,
                fontWeight: 'bolder',
                formatter: '{value}',
                color: 'inherit'
              },
              data: [{ value: materialRequests.approvedMaterialRequests, name: 'Approved' }]
            }
          ]
        };
        this.materialChartInstance.setOption(materialChartOption);
      }
      
      // Handle resize
      window.addEventListener('resize', () => {
        this.userChartInstance?.resize();
        this.projectChartInstance?.resize();
        this.materialChartInstance?.resize();
      });
    }, 0);
  }
}
