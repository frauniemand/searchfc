"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCAL_VOTER_ID = "local-user";

const regions = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "대전",
  "세종",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
];

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const makeVote = (hospitalId, hospitalName, status, date, voterId = LOCAL_VOTER_ID) => ({
  id: `${hospitalId}-${status}-${date}-${Math.random().toString(36).slice(2, 8)}`,
  hospitalId,
  hospitalName,
  status,
  date,
  voterId,
  createdAt: `${date} ${new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}`,
});

const sortVotesDesc = (votes) => {
  return [...votes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getHospitalStatus = (votes, hospitalId) => {
  const hospitalVotes = votes.filter((vote) => vote.hospitalId === hospitalId);
  if (hospitalVotes.length === 0) return "unknown";
  return sortVotesDesc(hospitalVotes)[0].status;
};

const getMyVote = (votes, hospitalId) => {
  const myVotes = votes.filter(
    (vote) => vote.hospitalId === hospitalId && vote.voterId === LOCAL_VOTER_ID
  );
  if (myVotes.length === 0) return null;
  return sortVotesDesc(myVotes)[0].status;
};

const getStatusMeta = (status) => {
  if (status === "open") {
    return {
      dotClass: "bg-green-500",
      badgeClass: "bg-green-100 text-green-700",
      label: "진료 가능",
    };
  }

  if (status === "closed") {
    return {
      dotClass: "bg-red-500",
      badgeClass: "bg-red-100 text-red-700",
      label: "진료 불가",
    };
  }

  return {
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-600",
    label: "확인 불가",
  };
};

const initialHospitals = [
  {
    id: 1,
    name: "차 여성의학연구소 서울역",
    region: "서울",
    address: "서울 중구 한강대로 416 일대",
    phone: "02-0000-0001",
    website: "https://example.com",
  },
  {
    id: 2,
    name: "마리아병원",
    region: "서울",
    address: "서울 동대문구 천호대로 317",
    phone: "02-0000-0002",
    website: "",
  },
  {
    id: 3,
    name: "서울라헬여성의원",
    region: "서울",
    address: "서울 서초구 강남대로 일대",
    phone: "02-0000-0003",
    website: "",
  },
];

const emptyForm = {
  name: "",
  region: "서울",
  address: "",
  phone: "",
  website: "",
};

export default function HospitalSearchPage() {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [votes, setVotes] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const match = [h.name, h.region, h.address, h.phone, h.website]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

      const regionMatch = regionFilter === "all" || h.region === regionFilter;
      return match && regionMatch;
    });
  }, [hospitals, query, regionFilter]);

  const openCreateDialog = () => {
    setForm(emptyForm);
  };

  const handleSaveHospital = () => {
    if (!form.name.trim()) return;

    setHospitals((prev) => [{ id: Date.now(), ...form }, ...prev]);
    setForm(emptyForm);
  };

  const handleVote = (hospital, status) => {
    const currentMyVote = getMyVote(votes, hospital.id);

    setVotes((prev) => {
      const withoutMyVotesForHospital = prev.filter(
        (vote) => !(vote.hospitalId === hospital.id && vote.voterId === LOCAL_VOTER_ID)
      );

      if (currentMyVote === status) {
        return withoutMyVotesForHospital;
      }

      const newVote = makeVote(hospital.id, hospital.name, status, getToday(), LOCAL_VOTER_ID);
      return [newVote, ...withoutMyVotesForHospital];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">난임병원 검색</h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-2xl" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> 병원 등록
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>병원 등록</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="병원명 *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="주소 (선택)"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <Input
                  placeholder="전화번호 (선택)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  placeholder="웹사이트 (선택)"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
                <Button onClick={handleSaveHospital}>등록</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="flex gap-4 p-4">
            <Input
              placeholder="병원명, 지역, 주소, 전화번호, 웹사이트 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="space-y-2 p-4 text-sm text-slate-600 md:p-6">
            <div>같은 버튼을 다시 누르면 내 투표가 취소됩니다.</div>
            <div>병원 등록 전 검색을 통해 이미 등록된 병원인지 확인해주세요.</div>
            <div>병원명은 네이버에 등록된 정확한 이름으로 입력 부탁드립니다.</div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredHospitals.map((h) => {
            const status = getHospitalStatus(votes, h.id);
            const meta = getStatusMeta(status);
            const hospitalVotes = votes.filter((v) => v.hospitalId === h.id);
            const openCount = hospitalVotes.filter((v) => v.status === "open").length;
            const closedCount = hospitalVotes.filter((v) => v.status === "closed").length;
            const myVote = getMyVote(votes, h.id);

            return (
              <Card key={h.id} className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      {h.name}
                      <span className={`h-3 w-3 rounded-full ${meta.dotClass}`} />
                    </CardTitle>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVote(h, "open")}
                        className={
                          myVote === "open" ? "bg-green-500 text-white hover:bg-green-500" : ""
                        }
                      >
                        가능 <CheckCircle2 className="ml-1 h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={myVote === "closed" ? "default" : "outline"}
                        onClick={() => handleVote(h, "closed")}
                        className={
                          myVote === "closed" ? "bg-red-500 text-white hover:bg-red-500" : ""
                        }
                      >
                        불가 <XCircle className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex gap-2 flex-wrap">
                    <Badge>{h.region}</Badge>
                    <Badge className={meta.badgeClass}>{meta.label}</Badge>
                    <Badge>
                      가능 {openCount} / 불가 {closedCount}
                    </Badge>
                    {myVote && (
                      <Badge variant="outline">내 투표: {myVote === "open" ? "가능" : "불가"}</Badge>
                    )}
                  </div>

                  {h.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      <span>{h.address}</span>
                    </div>
                  )}

                  {h.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4" />
                      <span>{h.phone}</span>
                    </div>
                  )}

                  {h.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="mt-0.5 h-4 w-4" />
                      <a
                        href={h.website}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-slate-700 underline underline-offset-4"
                      >
                        {h.website}
                      </a>
                    </div>
                  )}

                  {!h.address && !h.phone && !h.website && (
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
                      아직 등록된 상세 정보가 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
