//
//  MarketStatusBanner.swift
//  TradeFly AI
//
//  Market status banner showing market hours and major indices
//

import SwiftUI
import Combine

struct MarketStatusBanner: View {
    @StateObject private var service = MarketStatusService()

    var backgroundColor: Color {
        switch service.marketStatus.status {
        case "open":
            return .green
        case "pre_market", "after_hours":
            return .orange
        default:
            return .red
        }
    }

    var statusIcon: String {
        switch service.marketStatus.status {
        case "open":
            return "🟢"
        case "pre_market", "after_hours":
            return "🟡"
        default:
            return "🔴"
        }
    }

    var body: some View {
        VStack(spacing: 8) {
            // Market Status Row
            HStack(spacing: 12) {
                Text(statusIcon)
                    .font(.title3)

                VStack(alignment: .leading, spacing: 2) {
                    Text(service.marketStatus.statusText)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    if let timeRemaining = service.timeUntilNextChange {
                        Text(timeRemaining)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                if service.isLoading {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }

            // Indices Row
            if !service.marketStatus.indices.isEmpty {
                HStack(spacing: 20) {
                    ForEach(["SPY", "QQQ", "BTC"], id: \.self) { symbol in
                        if let index = service.marketStatus.indices[symbol] {
                            IndexChip(
                                symbol: symbol,
                                price: index.price,
                                changePercent: index.changePercent
                            )
                        }
                    }
                }
            }
        }
        .padding()
        .background(backgroundColor.opacity(0.1))
        .cornerRadius(12)
        .task {
            await service.fetchMarketStatus()
        }
    }
}

struct IndexChip: View {
    let symbol: String
    let price: Double
    let changePercent: Double

    var changeColor: Color {
        if changePercent > 0 { return .green }
        else if changePercent < 0 { return .red }
        else { return .gray }
    }

    var body: some View {
        VStack(spacing: 2) {
            Text(symbol)
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.secondary)

            if price > 0 {
                Text(String(format: changePercent >= 0 ? "+%.1f%%" : "%.1f%%", changePercent))
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(changeColor)
            } else {
                Text("-")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Market Status Service

@MainActor
class MarketStatusService: ObservableObject {
    @Published var marketStatus = MarketStatus()
    @Published var isLoading = false
    private var timer: Timer?

    var timeUntilNextChange: String? {
        guard let nextChange = marketStatus.nextChange else { return nil }

        let formatter = ISO8601DateFormatter()
        guard let nextDate = formatter.date(from: nextChange) else { return nil }

        let now = Date()
        let interval = nextDate.timeIntervalSince(now)

        if interval <= 0 { return nil }

        let hours = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60

        if hours > 0 {
            return "in \(hours)h \(minutes)m"
        } else {
            return "in \(minutes)m"
        }
    }

    func fetchMarketStatus() async {
        isLoading = true

        do {
            let backendURL = SupabaseConfig.backendURL
            guard let url = URL(string: "\(backendURL)/market-status") else { return }

            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(MarketStatusResponse.self, from: data)

            marketStatus = MarketStatus(
                status: response.status,
                statusText: response.statusText,
                isOpen: response.isOpen,
                nextChange: response.nextChange,
                indices: response.indices
            )
        } catch {
            print("Failed to fetch market status: \(error)")
        }

        isLoading = false

        // Auto-refresh every minute
        startTimer()
    }

    private func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 60.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.fetchMarketStatus()
            }
        }
    }

    deinit {
        timer?.invalidate()
    }
}

// MARK: - Models

struct MarketStatus {
    var status: String = "closed"
    var statusText: String = "Markets Closed"
    var isOpen: Bool = false
    var nextChange: String? = nil
    var indices: [String: IndexData] = [:]
}

struct IndexData {
    let price: Double
    let changePercent: Double
}

struct MarketStatusResponse: Decodable {
    let status: String
    let statusText: String
    let isOpen: Bool
    let nextChange: String?
    let indices: [String: IndexDataResponse]

    enum CodingKeys: String, CodingKey {
        case status
        case statusText = "status_text"
        case isOpen = "is_open"
        case nextChange = "next_change"
        case indices
    }
}

struct IndexDataResponse: Decodable {
    let price: Double
    let changePercent: Double

    enum CodingKeys: String, CodingKey {
        case price
        case changePercent = "change_percent"
    }
}

// MARK: - Extension for MarketStatusResponse to MarketStatus conversion
extension MarketStatus {
    init(status: String, statusText: String, isOpen: Bool, nextChange: String?, indices: [String: IndexDataResponse]) {
        self.status = status
        self.statusText = statusText
        self.isOpen = isOpen
        self.nextChange = nextChange
        self.indices = indices.mapValues { IndexData(price: $0.price, changePercent: $0.changePercent) }
    }
}

#Preview {
    MarketStatusBanner()
}
