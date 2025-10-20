package org.cardanofoundation.reeve.indexer.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.cardanofoundation.reeve.indexer.model.response.DataResponse;
import org.cardanofoundation.reeve.indexer.service.ContractService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class ContractController {

    private final ContractService contractService;

    @GetMapping("/asset/{name}/datum/history")
    public ResponseEntity<List<DataResponse>> getAssetsByName(@PathVariable("name") String name) {
    return ResponseEntity.ok(contractService.getDataForAssetName(name));
    }

    @GetMapping("/asset/{name}/datum/current")
    public ResponseEntity<DataResponse> getCurrentAssetByName(@PathVariable("name") String name) {
    return ResponseEntity.ok(contractService.getCurrentDataForAssetName(name));
    }

    @GetMapping("/asset/{name}/redeemer/current")
    public ResponseEntity<DataResponse> getCurrentRedeemerByName(@PathVariable("name") String name) {
    return ResponseEntity.ok(contractService.getCurrentRedeemerDataForAssetName(name));
    }

}
